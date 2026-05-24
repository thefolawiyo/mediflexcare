// Seeds demo users + sample patient data. Idempotent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type Role = "admin" | "doctor" | "nurse" | "receptionist" | "lab" | "pharmacy" | "patient";

const demoUsers: Array<{
  email: string;
  password: string;
  role: Role;
  full_name: string;
  department?: string;
  specialization?: string;
}> = [
  { email: "admin@mediflex.com", password: "admin123", role: "admin", full_name: "Rachel Green", department: "Administration" },
  { email: "doctor@mediflex.com", password: "doctor123", role: "doctor", full_name: "Dr. Sarah Chen", department: "Cardiology", specialization: "Interventional Cardiology" },
  { email: "nurse@mediflex.com", password: "nurse123", role: "nurse", full_name: "James Wilson", department: "General" },
  { email: "frontdesk@mediflex.com", password: "frontdesk123", role: "receptionist", full_name: "Maria Santos", department: "Front Desk" },
  { email: "lab@mediflex.com", password: "lab123", role: "lab", full_name: "Dr. Michael Ross", department: "Laboratory", specialization: "Clinical Pathology" },
  { email: "pharmacy@mediflex.com", password: "pharmacy123", role: "pharmacy", full_name: "Emily Davis", department: "Pharmacy" },
  { email: "patient@mediflex.com", password: "patient123", role: "patient", full_name: "John Smith" },
];

async function ensureUser(u: typeof demoUsers[number]) {
  // Try to find existing
  const { data: list } = await admin.auth.admin.listUsers();
  let user = list?.users.find((x) => x.email === u.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });
    if (error) throw error;
    user = data.user!;
  }

  // Upsert profile
  await admin.from("profiles").upsert({
    id: user.id,
    full_name: u.full_name,
    email: u.email,
    department: u.department ?? null,
    specialization: u.specialization ?? null,
  });

  // Upsert role
  await admin.from("user_roles").upsert(
    { user_id: user.id, role: u.role },
    { onConflict: "user_id,role" },
  );

  return user.id;
}

async function seedPatientData(patientUserId: string, doctorUserId: string) {
  // Create patient record linked to patient user (idempotent by user_id)
  const { data: existing } = await admin
    .from("patients")
    .select("id")
    .eq("user_id", patientUserId)
    .maybeSingle();

  let patientId = existing?.id;
  if (!patientId) {
    const { data, error } = await admin
      .from("patients")
      .insert({
        user_id: patientUserId,
        name: "John Smith",
        email: "patient@mediflex.com",
        phone: "+1 (555) 123-4567",
        date_of_birth: "1985-03-15",
        gender: "male",
        blood_type: "O+",
        address: "123 Main Street, New York, NY 10001",
        emergency_contact: "+1 (555) 987-6543",
        insurance_provider: "BlueCross",
        insurance_id: "BC-123456",
      })
      .select("id")
      .single();
    if (error) throw error;
    patientId = data.id;
  }

  // Seed some appointments / labs / prescriptions if none exist for this patient
  const { count: apptCount } = await admin
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("patient_id", patientId);

  if ((apptCount ?? 0) === 0) {
    await admin.from("appointments").insert([
      {
        patient_id: patientId,
        doctor_id: doctorUserId,
        doctor_name: "Dr. Sarah Chen",
        department: "Cardiology",
        appt_date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        appt_time: "09:00:00",
        status: "scheduled",
        type: "consultation",
        notes: "Annual cardiac checkup",
      },
      {
        patient_id: patientId,
        doctor_id: doctorUserId,
        doctor_name: "Dr. Sarah Chen",
        department: "Cardiology",
        appt_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
        appt_time: "10:30:00",
        status: "completed",
        type: "follow-up",
      },
    ]);

    await admin.from("lab_tests").insert([
      {
        patient_id: patientId,
        ordered_by: doctorUserId,
        ordered_by_name: "Dr. Sarah Chen",
        test_type: "Complete Blood Count (CBC)",
        status: "completed",
        priority: "routine",
        completed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        results: "All values within normal range.",
      },
      {
        patient_id: patientId,
        ordered_by: doctorUserId,
        ordered_by_name: "Dr. Sarah Chen",
        test_type: "Lipid Panel",
        status: "in-progress",
        priority: "routine",
      },
    ]);

    await admin.from("prescriptions").insert([
      {
        patient_id: patientId,
        prescribed_by: doctorUserId,
        prescribed_by_name: "Dr. Sarah Chen",
        medication: "Lisinopril 10mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        duration: "30 days",
        status: "dispensed",
        dispensed_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        patient_id: patientId,
        prescribed_by: doctorUserId,
        prescribed_by_name: "Dr. Sarah Chen",
        medication: "Atorvastatin 20mg",
        dosage: "1 tablet",
        frequency: "Once daily at bedtime",
        duration: "90 days",
        status: "pending",
      },
    ]);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ids: Record<string, string> = {};
    for (const u of demoUsers) {
      ids[u.role] = await ensureUser(u);
    }
    await seedPatientData(ids.patient, ids.doctor);

    return new Response(JSON.stringify({ ok: true, message: "Demo users ready" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
