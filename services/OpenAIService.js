const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async enhanceContent(originalText) {
    try {
      const prompt = `เรียบเรียงเนื้อหาใหม่ ให้ต่างจากต้นฉบับ "${originalText}" โดยอ้างอิงจากข้อเท็จจริงที่เกิดขึ้น โดยเนื้อหาใหม่ที่สร้างขึ้น จะต้องมีความสร้างสรรค์ มี emoji มี hashtag เว้นวรรค หรือพารากราฟให้อ่านง่าย ไม่กระโดด และเนื้อหาจะต้องดึงดูดผู้อ่าน ให้อยากมีส่วนร่วมในการกดไลค์ กดแชร์ หรือคอมเม้น เพื่อสร้างไวรัลหรือ engagement ให้โพสต์ และอยู่ภายใต้มาตรฐานชุมชนของเฟสบุ๊ค`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "คุณเป็นผู้เชี่ยวชาญด้านการเขียนเนื้อหาสำหรับโซเชียลมีเดีย โดยเฉพาะ Facebook ที่สามารถสร้างเนื้อหาที่น่าสนใจ มี engagement สูง และเป็นไปตามมาตรฐานชุมชน"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI error:', error);
      // Fallback to original text if OpenAI fails
      return originalText;
    }
  }

  async generateMultipleVariations(originalText, count = 3) {
    try {
      const variations = [];
      
      for (let i = 0; i < count; i++) {
        const prompt = `สร้างเนื้อหาใหม่สำหรับโซเชียลมีเดีย จากข้อความต้นฉบับ: "${originalText}" 
        
        ข้อกำหนด:
        - เนื้อหาต้องแตกต่างจากต้นฉบับ
        - เพิ่ม emoji ที่เหมาะสม
        - เพิ่ม hashtag ที่เกี่ยวข้อง
        - จัดรูปแบบให้อ่านง่าย
        - สร้าง engagement สูง
        - อยู่ภายใต้มาตรฐานชุมชน Facebook
        - ความยาวไม่เกิน 200 คำ`;

        const completion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "คุณเป็นผู้เชี่ยวชาญด้านการเขียนเนื้อหาสำหรับโซเชียลมีเดีย"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.9
        });

        variations.push(completion.choices[0].message.content.trim());
      }

      return variations;
    } catch (error) {
      console.error('OpenAI variations error:', error);
      return [originalText];
    }
  }

  async analyzeContent(content) {
    try {
      const prompt = `วิเคราะห์เนื้อหานี้สำหรับโซเชียลมีเดีย: "${content}"
      
      ให้คะแนนในแต่ละด้าน (1-10):
      - ความน่าสนใจ
      - ความเหมาะสมกับ Facebook
      - ศักยภาพในการสร้าง engagement
      - ความสร้างสรรค์
      
      และให้คำแนะนำในการปรับปรุง`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์เนื้อหาโซเชียลมีเดีย"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      return 'ไม่สามารถวิเคราะห์เนื้อหาได้';
    }
  }
}

module.exports = new OpenAIService();
