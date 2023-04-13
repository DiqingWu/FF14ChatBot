import { OPENAI_API_KEY } from '../setting/config'
import axios from "axios";

export async function getOpenAIResponse(prompt, url) {
  try {
    const response = await axios.post(url, {
      prompt: prompt,
      max_tokens: 4000,
      temperature: 0.5,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 0.95,
      // 下面两个参数目前用不到
      // stream: true,
      // best_of: 1,
      stop: ["<|im_end|>"]
    }, {
      headers: {
        // 关闭了 event-stream的格式，打开的话可以增加用户体验。
        'Content-Type': 'application/json',
        // 'Content-Type':'text/event-stream',
        'api-key': OPENAI_API_KEY
      }
    });
    console.log(response);
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(error);
    return "这句话被和谐了，(⊙﹏⊙)。试试别的吧，尤其是别搞带颜色的啊，光呆."
  }
}