export type Task = { values: string[]; version: string; pdfUrl?: string; startDate?: string };
export function emptyTaskValues(): string[] {
 const values=Array<string>(11).fill('');
 values[2]='งาน';values[4]='ยังไม่เริ่ม';values[5]='ปกติ';
 return values;
}
export const options: Record<number, string[]> = {2:['งาน','ไอเดีย','ปัญหา','อื่นๆ'],4:['','ยังไม่เริ่ม','กำลังดำเนินการ','ติดขัด','เสร็จแล้ว'],5:['','ต่ำ','ปกติ','สูง','ด่วน']};
export function validateValues(input: unknown): string[] {
 if (!Array.isArray(input) || input.length !== 11 || !input.every(v=>typeof v==='string' && v.length<=5000)) throw new Error('ข้อมูลไม่ถูกต้อง');
 if (!input[1].trim() || input[1].length>300) throw new Error('กรุณากรอกชื่องานไม่เกิน 300 ตัวอักษร');
 for (const [index, choices] of Object.entries(options)) if (!choices.includes(input[Number(index)])) throw new Error('ค่าประเภท สถานะ หรือความสำคัญไม่ถูกต้อง');
 return input;
}
