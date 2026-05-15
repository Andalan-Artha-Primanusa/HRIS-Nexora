# Prioritas Fix Gelombang 1 Sebelum Production

Dokumen ini menyusun temuan audit Gelombang 1 berdasarkan risiko production, bukan berdasarkan urutan menu.

## Kategori prioritas

| Level | Makna |
|---|---|
| P0 | Wajib dibenahi sebelum production. Ada flow yang rusak / kontrak frontend-backend tidak cocok. |
| P1 | Sangat dianjurkan sebelum production. Flow jalan, tetapi berisiko menimbulkan akses salah, approval salah, atau pengalaman buruk yang signifikan. |
| P2 | Perlu dibenahi, tetapi bisa dijadwalkan setelah isu kritis beres. |

---

# P0 — wajib sebelum production

| Modul | Masalah | Dampak | Alasan prioritas | Rekomendasi |
|---|---|---|---|---|
| Overtime | Frontend memanggil `POST /my/overtime`, tetapi backend `api.php` tidak memiliki endpoint itu | Upload bukti lembur bisa gagal saat record belum punya request | Kontrak FE-BE putus; flow inti bisa benar-benar macet | Tambahkan route backend untuk create overtime request, atau ubah flow frontend agar memakai endpoint existing yang memang tersedia |
| Payroll | Flow approval dua tahap backend (`manager-approve`, `hr-approve`, `reject`) belum menjadi flow aktif utama di router frontend | User bisa memakai UI aktif yang tidak merepresentasikan proses approval sebenarnya | Risiko proses payroll disetujui lewat jalur yang tidak sesuai desain bisnis | Jadikan flow manager→HR sebagai jalur resmi di `/payroll/process` atau aktifkan route halaman approval khusus |
| Admin / RBAC | Frontend service menyediakan `GET /admin/users/{id}`, tetapi backend tidak punya route tersebut | Fitur yang memakai detail user akan gagal 404 ketika dipakai | Mismatch endpoint nyata | Tambahkan endpoint backend atau hapus/ubah service jika memang tidak dibutuhkan |

---

# P1 — sangat dianjurkan sebelum production

| Modul | Masalah | Dampak | Rekomendasi |
|---|---|---|---|
| Semua modul Gelombang 1 | Banyak route sensitif hanya dijaga `ProtectedRoute` (authenticated), bukan guard akses frontend yang konsisten | User bisa masuk halaman sensitif lewat URL langsung walau akhirnya backend menolak | Tambahkan guard menu/permission konsisten untuk modul sensitif |
| Leave | Approval memakai fallback menu key lama (`cuti.persetujuan`, `leave.approval`) | Potensi inkonsistensi akses UI terhadap menuKey terbaru | Ganti ke key resmi `manajemen-cuti.persetujuan` |
| Leave | Kalender default di-hardcode April 2026 | UX membingungkan setelah tanggal berubah | Default ke bulan berjalan |
| Payroll | Ada dua generasi UI payroll: route aktif baru vs halaman lama yang lebih lengkap | Kebingungan maintenance; behavior bisa terpecah | Konsolidasikan jadi satu flow payroll resmi |
| Reimbursement | Ada tiga representasi UI domain reimbursement | Sulit dites, rawan inkonsistensi bugfix | Pilih satu flow resmi; arsipkan atau hapus layar legacy |
| Overtime | Ada dua UI approval berbeda (`OvertimePage` dan `OvertimeApprovalPage`) | Logic duplikat dan potensi hasil berbeda | Konsolidasikan ke satu implementation |
| Leave / Reimbursement / Payroll / Overtime | Error `422`, `403`, `500` mayoritas hanya toast umum | User tidak tahu field mana salah; forbidden tidak komunikatif; debugging sulit | Tambahkan error contract terstandar: field errors, forbidden state, retry/fallback |
| Leave / Admin / Reimbursement | Filter/statistik dihitung dari data halaman aktif | Angka summary dan hasil filter bisa menyesatkan | Pindahkan agregasi/filter ke backend atau fetch total yang sesuai |

---

# P2 — peningkatan kualitas

| Modul | Masalah | Dampak | Rekomendasi |
|---|---|---|---|
| Admin / RBAC | Search users/roles hanya bekerja pada halaman aktif | UX kurang lengkap untuk dataset besar | Server-side search |
| Admin / Menu Permission | Saat satu menu disimpan, seluruh checkbox satu baris ikut spinner | Minor UX roughness | Saving state per `(menuKey, roleId)` |
| Leave | Redirect create menunggu 1.5 detik | Flow terasa lambat | Redirect langsung setelah toast atau gunakan toast non-blocking |
| Leave / Payroll / Reimbursement / Overtime | Beberapa halaman punya halaman file eksis tapi bukan route aktif | Menambah beban maintenance | Bersihkan dead pages atau dokumentasikan status legacy |
| Overtime | Employee flow menggabungkan attendance summary dan request lewat heuristik ID/tanggal | Rentan jika data tidak sinkron | Gunakan satu endpoint backend yang sudah mengembalikan model lembur final |

---

# Urutan fix yang saya sarankan

```text
Tahap 1 — pulihkan kontrak yang rusak
1. Overtime POST /my/overtime mismatch
2. Payroll approval flow route aktif
3. Admin GET /admin/users/{id} mismatch

Tahap 2 — rapikan pagar akses dan kebenaran bisnis
4. Guard frontend untuk route sensitif
5. Konsolidasi flow Payroll / Reimbursement / Overtime
6. Perbaiki menuKey approval Leave

Tahap 3 — kualitas produksi
7. Standardisasi error handling 422/403/500
8. Statistik/filter server-side
9. Bersihkan halaman legacy dan UX minor
```

---

# Rekomendasi keputusan teknis

## 1. Overtime
Pilih salah satu:
- **Opsi A**: backend menyediakan `POST /my/overtime` untuk membuat request dari `attendance_id`
- **Opsi B**: frontend tidak lagi membuat request sendiri; backend otomatis membuat saat ada lembur atau menyediakan endpoint khusus lain yang benar

**Saran saya:** Opsi A bila model bisnis Anda memang mengizinkan karyawan membuat request lembur secara eksplisit.

## 2. Payroll
Pilih salah satu:
- **Opsi A**: aktifkan `PayrollApprovePage` sebagai flow resmi
- **Opsi B**: pindahkan seluruh logic dua tahap ke halaman aktif `/payroll/process`

**Saran saya:** Opsi B jika Anda ingin pengalaman pengguna lebih ringkas; Opsi A jika organisasi Anda ingin area approval terpisah dan sangat jelas.

## 3. Reimbursement & Overtime UI ganda
Jangan dibiarkan lama. UI ganda adalah tempat bug bersembunyi dengan tenang.

**Saran saya:** tetapkan satu “golden path” per domain:
- Reimbursement: ESS page + satu admin management page
- Overtime: satu ESS/admin-adaptive page **atau** satu ESS page + satu approval page, tapi bukan dua implementasi yang tumpang tindih

---

# Setelah ini lanjut ke mana?

Setelah prioritas fix ini disepakati, jalur paling sehat adalah:

1. lanjut audit **Gelombang 2 — approval & lifecycle**
   - Employee Management
   - Assets
   - Promotions
   - Training & Competency
   - Workforce / Shift Swap

2. setelah semua gelombang selesai, baru susun:
   - master defect backlog
   - matrix risiko production
   - urutan implementasi fix lintas-modul
   - smoke test checklist sebelum go-live

