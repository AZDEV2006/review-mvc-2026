# SUBMISSION - Exit Exam MVC 1/2569 (อาทิตย์เช้า)

## 1. วิธีเปิดโปรแกรม
- ภาษา/เฟรมเวิร์ก: Node.js, Express.js, EJS
- Entry point / คำสั่งเปิดโปรแกรม:
  - ติดตั้ง dependency: `npm install`
  - เปิดโปรแกรม: `npm run dev`
  - เข้าใช้งานหน้าเว็บ: `http://localhost:8081/`
- หมายเหตุที่จำเป็น (ถ้ามี): ค่า port ตั้งต้นอยู่ที่ `8081` จาก `app.js` หาก port นี้ถูกใช้งานอยู่ สามารถรันด้วย port อื่นได้ เช่น `PORT=8091 npm run dev`

## 2. ตารางเชื่อมโยง Requirements

| Requirement | Model / Domain | Controller / Action | View / Screen |
|---|---|---|---|
| R1 แสดงข้อมูลการเลือกตั้ง ผู้สมัคร ผู้มีสิทธิ์ เจ้าหน้าที่ และบัตรจากข้อมูลตั้งต้น | `ElectionModel`, `CandidateModel`, `VoterModel`, `OfficerModel`, `BallotModel` และ domain ในโฟลเดอร์ `domain/` | `ElectionController.startData()`, `home()`, `candidates()`, `voters()`, `status()` | `views/index.ejs`, API `/api/candidates`, `/api/voters`, `/api/status` |
| R2 ลงคะแนนแบบจัดอันดับ 3 อันดับ | `BallotModel.voteLeaw()`, `VoterModel`, `CandidateModel`, `Ballot` | `ElectionController.vote()` ผ่าน `POST /api/vote` | ฟอร์ม "ลงคะแนน" ใน `views/index.ejs` |
| R3 ตรวจสอบเงื่อนไขการลงคะแนน เช่น เลือกครบ 3 คน, ห้ามซ้ำในบัตรเดียว, ผู้มีสิทธิ์ต้องมีอยู่และยังไม่เคยลงคะแนน | `BallotModel.voteLeaw()`, `VoterModel.isActive()`, `BallotModel.hasVoted()` | `ElectionController.vote()` | ข้อความตอบกลับในหน้าเว็บผ่าน `#msg` และ JSON response |
| R4 ปิดรับคะแนนโดยเจ้าหน้าที่ และตรวจรูปแบบบัตรที่ซ้ำตาม threshold | `ElectionModel.close()`, `BallotModel.checkIsRepeatPattern()`, `OfficerModel` | `ElectionController.close()` ผ่าน `POST /api/close` | ฟอร์ม "เจ้าหน้าที่" และตาราง "กลุ่มบัตร" |
| R5 รับรองหรือไม่นับกลุ่มบัตรที่รอตรวจสอบ และสรุปคะแนนจากบัตรที่รับรองแล้ว | `BallotModel.decideGroup()`, `scoreBoard()`, `countBallotStatus()`, `ElectionModel.finish()` | `ElectionController.decideGroup()` ผ่าน `POST /api/groups/:groupId/decide` | ตาราง "กลุ่มบัตร", "ผู้สมัคร", และ "บัตร" |

## 3. ผลการทดสอบ

| กรณี | ผ่าน/ไม่ผ่าน | หมายเหตุ (เฉพาะที่จำเป็น) |
|---|---|---|
| T1 เปิดโปรแกรมด้วย `npm run dev` | ผ่าน | เครื่องทดสอบมี port `8081` ถูกใช้งานอยู่ จึงทดสอบด้วย `PORT=8091 npm run dev` และ server แสดง `Server listen port 8091` |
| T2 เปิดหน้า `/` | ผ่าน | หน้า EJS render ชื่อการเลือกตั้ง สถานะ รายชื่อผู้สมัคร กลุ่มบัตร และรายการบัตรได้ |
| T3 เรียกดูข้อมูลผ่าน `/api/candidates`, `/api/voters`, `/api/status` | ผ่าน | ได้ข้อมูลผู้สมัคร 5 คน, ผู้มีสิทธิ์ 7 คน และสถานะเริ่มต้น `OPEN` |
| T4 ลงคะแนนสำเร็จผ่าน `POST /api/vote` | ผ่าน | ทดสอบ `V04` เลือก `C01,C02,C03` ได้บัตรใหม่ `B04` |
| T5 ป้องกันการเลือกผู้สมัครซ้ำในบัตรเดียว | ผ่าน | ทดสอบ `C01,C01,C03` แล้วระบบตอบ `ปฏิเสธ: ไม่สามารถเลือกผู้สมัครซ้ำกันในบัตรใบเดียวกันได้` |
| T6 ปิดรับคะแนน ตรวจ pattern ซ้ำ และตัดสินกลุ่ม | ผ่าน | หลังปิดรับคะแนนพบกลุ่ม `C01>C02>C03` รอตรวจสอบ 3 ใบ จากนั้นรับรองกลุ่มแล้วสถานะเปลี่ยนเป็น `สรุปผลแล้ว` |

## 4. ความแตกต่างระหว่างแบบที่ออกกับโปรแกรมจริง (ถ้ามี)
ระบุไม่เกิน 3 ข้อ
1. ใช้ `seed_data.json` เป็นข้อมูลตั้งต้น และเก็บข้อมูลที่เปลี่ยนระหว่างรันไว้ใน memory ดังนั้นเมื่อ restart server ข้อมูลจะกลับไปตามไฟล์ seed
2. ส่วนติดต่อผู้ใช้เป็นหน้า EJS แบบเรียบง่ายในหน้าเดียว โดยเน้นให้ทดสอบ flow หลักได้ครบ
3. ระบบยังไม่มี login แยกสิทธิ์เจ้าหน้าที่ ใช้การเลือก `officerId` จากข้อมูลตั้งต้นเพื่อปิดรับคะแนน

## 5. บันทึกการใช้ Generative AI
หากไม่ได้ใช้ ให้ระบุ **ไม่ได้ใช้ Generative AI**

| เวลาโดยประมาณ | เครื่องมือ | ใช้เพื่ออะไร | นำคำแนะนำไปใช้อย่างไร |
|---|---|---|---|
| 30 ส.ค. 2569 11.45 | ChatGPT Codex | ตรวจโครงสร้าง MVC และช่วยเติมเอกสาร `SUBMISSION.md` | นำไปจัดทำคำอธิบายวิธีรัน ตาราง requirements และผลทดสอบ |
| 30 ส.ค. 2569 12.00 | ChatGPT Codex | ช่วยรันตรวจ endpoint หลักของโปรแกรม | ใช้ผลการทดสอบจริงเติมในตาราง T1-T6 |
