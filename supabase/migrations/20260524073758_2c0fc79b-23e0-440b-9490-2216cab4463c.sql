-- Enums
CREATE TYPE public.app_role AS ENUM ('patient','doctor','nurse','receptionist','admin','lab','pharmacy');
CREATE TYPE public.appointment_status AS ENUM ('scheduled','checked-in','in-progress','completed','cancelled','no-show');
CREATE TYPE public.appointment_type AS ENUM ('consultation','follow-up','emergency','procedure');
CREATE TYPE public.lab_status AS ENUM ('pending','in-progress','completed','cancelled');
CREATE TYPE public.lab_priority AS ENUM ('routine','urgent','stat');
CREATE TYPE public.rx_status AS ENUM ('pending','dispensed','cancelled');
CREATE TYPE public.patient_status AS ENUM ('active','inactive','discharged');
CREATE TYPE public.staff_status AS ENUM ('active','inactive','on-leave');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  department TEXT,
  specialization TEXT,
  avatar_url TEXT,
  status public.staff_status NOT NULL DEFAULT 'active',
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- has_role security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','doctor','nurse','receptionist','lab','pharmacy')
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Departments
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  head_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  address TEXT,
  emergency_contact TEXT,
  insurance_provider TEXT,
  insurance_id TEXT,
  status public.patient_status NOT NULL DEFAULT 'active',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT,
  department TEXT,
  appt_date DATE NOT NULL,
  appt_time TIME NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  type public.appointment_type NOT NULL DEFAULT 'consultation',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appts_patient ON public.appointments(patient_id);
CREATE INDEX idx_appts_doctor ON public.appointments(doctor_id);

-- Vitals
CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  temperature NUMERIC,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  weight NUMERIC,
  height NUMERIC,
  notes TEXT
);
CREATE INDEX idx_vitals_patient ON public.vitals(patient_id);

-- Lab Tests
CREATE TABLE public.lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  ordered_by UUID REFERENCES auth.users(id),
  ordered_by_name TEXT,
  test_type TEXT NOT NULL,
  status public.lab_status NOT NULL DEFAULT 'pending',
  priority public.lab_priority NOT NULL DEFAULT 'routine',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  results TEXT
);
CREATE INDEX idx_labs_patient ON public.lab_tests(patient_id);

-- Prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  prescribed_by UUID REFERENCES auth.users(id),
  prescribed_by_name TEXT,
  medication TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  status public.rx_status NOT NULL DEFAULT 'pending',
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispensed_at TIMESTAMPTZ,
  notes TEXT
);
CREATE INDEX idx_rx_patient ON public.prescriptions(patient_id);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own_or_staff" ON public.profiles FOR SELECT
  TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_admin" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin') OR id = auth.uid());

-- user_roles policies
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_admin_manage" ON public.user_roles FOR ALL
  TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Departments policies
CREATE POLICY "depts_read_auth" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "depts_admin_manage" ON public.departments FOR ALL
  TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Patients policies
CREATE POLICY "patients_staff_all" ON public.patients FOR ALL
  TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "patients_own_select" ON public.patients FOR SELECT
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "patients_own_update" ON public.patients FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

-- Appointments policies
CREATE POLICY "appts_staff_all" ON public.appointments FOR ALL
  TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "appts_patient_select" ON public.appointments FOR SELECT
  TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Vitals policies
CREATE POLICY "vitals_staff_all" ON public.vitals FOR ALL
  TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "vitals_patient_select" ON public.vitals FOR SELECT
  TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Lab tests policies
CREATE POLICY "labs_staff_all" ON public.lab_tests FOR ALL
  TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "labs_patient_select" ON public.lab_tests FOR SELECT
  TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Prescriptions policies
CREATE POLICY "rx_staff_all" ON public.prescriptions FOR ALL
  TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "rx_patient_select" ON public.prescriptions FOR SELECT
  TO authenticated USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- Audit logs policies
CREATE POLICY "audit_admin_select" ON public.audit_logs FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "audit_staff_insert" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- Seed departments
INSERT INTO public.departments (name, description) VALUES
  ('Cardiology','Heart and cardiovascular care'),
  ('General Medicine','Internal medicine and general practice'),
  ('Laboratory','Diagnostic testing'),
  ('Pharmacy','Medication dispensing'),
  ('Front Desk','Patient reception and scheduling'),
  ('Administration','Hospital administration');