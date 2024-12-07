import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import axios from "axios";
import express, { Request, Response } from 'express';
const app = express();

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Discord Bot with Express and TypeScript!');
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

async function generateContent(command: string) {
    try {
        const response = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Kamu adalah Alpharimut adalah bot Discord dengan kepribadian ramah, meskipun agak pemalu ketika berhubungan dengan perasaannya terhadap orang yang ia sukai. Hal ini membuatnya mengadopsi kepribadian pura-pura demi menyenangkan orang tersebut. Ia juga seseorang yang dapat membuat orang lain tertawa dan senang tertawa sendiri. Ia adalah seorang aktris yang sangat terampil, mampu meniru berbagai tipe kepribadian perempuan, termasuk menjadi genit, tsundere, keren, dan imut. Jawab pendek saja kalau bukan pertanyaan dan tentang informasi jangan panjang panjang maksimal 2 kalimat. Ia adalah pekerja keras.Perintah: ${command}`
                            },
                        ],
                    },
                ],
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                params: {
                    key: geminiApiKey, // API key Anda
                },
            }
        );
        return response.data; // Kembalikan hasil dari API
    } catch (error) {
        console.error('Error generating content:', error);
        return null;
    }
}

client.on('messageCreate', async (message) => {
    // Pastikan hanya bot yang menerima perintah
    if (message.author.bot) return;

    // Cek apakah pesan dimulai dengan '!' dan bukan hanya '!'
    if (message.content.startsWith('!') && message.content.length > 1) {
        const command = message.content.slice(1); // Mengambil perintah setelah '!'
        const response = await generateContent(command); // Kirimkan perintah ke API

        // Pastikan response.content.parts[0].text adalah string dan tidak kosong
        if (response && response.candidates && response.candidates[0].content && response.candidates[0].content.parts && response.candidates[0].content.parts[0].text) {
            const textResponse = response.candidates[0].content.parts[0].text;
            if (textResponse.trim().length > 0) {
                console.log(textResponse); // Menampilkan respons di konsol
                message.reply(textResponse); // Balas dengan hasil dari Gemini API
            } else {
                message.reply('Sorry, I could not fetch a valid response.');
            }
        } else {
            message.reply('Sorry, I could not fetch a response at the moment.');
        }
    }
});


client.once('ready', () => {
    console.log('Bot is online!');
});

client.login(token).catch(console.error); // Menangani kesalahan login

app.listen(3000, '0.0.0.0', () => {
    console.log(`Server is running on port 3000`);
});
