import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

/**
 * Generates a ~200-word summary of a blog post using Gemini Flash.
 * Called from the AI summary API route AFTER the post is saved.
 * The API route checks `summary IS NULL` before calling this —
 * so it truly runs only once per post.
 */
export async function generatePostSummary(
  title: string,
  body: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a professional blog editor. Write a concise, engaging summary of the blog post below in 150–200 words. Capture the key points and what the reader will learn. Write in third person. Do not include headings.

Title: ${title}

Content:
${body.slice(0, 4000)}

Summary:`

  const result = await model.generateContent(prompt)
  return result.response.text().trim()
}
