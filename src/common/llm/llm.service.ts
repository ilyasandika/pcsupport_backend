import { GoogleGenAI, Type } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EngineerAnalysisResult {
  tags: string[];
  review: string;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private ai: GoogleGenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('GEMINI_API_KEY is not configured in environment.');
    }
  }

  async generateEngineerAnalysis(
    engineerId: string | number,
    ticketsJson: string,
    periodLabel?: string,
  ): Promise<EngineerAnalysisResult> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!this.ai) {
      if (!apiKey) {
        throw new Error(
          'GEMINI_API_KEY is missing from environment variables.',
        );
      }
      this.ai = new GoogleGenAI({ apiKey });
    }

    const periodText = periodLabel ? ` (Periode: ${periodLabel})` : '';
    const prompt = `
      ROLE:
      Kamu adalah IT Support Manager. 
      
      TASK:
      Analisis sekumpulan data penyelesaian tiket dari Engineer ID: ${engineerId}${periodText} berikut.
      
      Catatan Field Tiket & Ketentuan Konotasi Evaluasi:
      - Field \`slaRemainingRatio\` adalah sisa waktu SLA pengerjaan tiket dalam skala 0 s/d 1 (contoh: 0.70 = tersisa 70% waktu SLA / sangat cepat; 0.05 = tersisa 5% waktu SLA / mepet; angka negatif < 0 = pengerjaan terlambat/melewati batas SLA).
      - ATURAN PENTING KONOTASI: Selagi \`slaRemainingRatio >= 0\` (sisa waktu tidak kurang dari 0), pengerjaan tiket HARUS TETAP DIANGGAP POSITIF DAN SUKSES SESUAI TARGET SLA (engineer tetap berhasil memenuhi SLA tepat waktu). Jangan berikan konotasi negatif atau kritikan jika \`slaRemainingRatio >= 0\`. Hanya berikan masukan evaluasi kritikal jika \`slaRemainingRatio < 0\` (benar-benar terlambat melebihi SLA) atau jika penulisan deskripsi solusi tiket terlalu singkat/kurang jelas.
      
      Instruksi:
      1. Berikan TEPAT 3 tag spesialisasi keahlian teknis yang paling mewakili keahlian engineer berdasarkan riwayat penanganan tiket tersebut. 
      KAMU WAJIB MEMILIH HANYA DARI DAFTAR TAG BERIKUT INI (DILARANG KERAS MEMBUAT TAG LAIN DI LUAR DAFTAR INI):
      - Standard Software Support
      - Specialized/Mining Software Support
      - PC Specialist
      - NB Specialist
      - NB & PC Specialist
      - Workstation (MW/WS) Specialist
      - Mac/Apple Specialist
      - Hardware Upgrade & Maintenance
      - Windows OS Support
      - Linux OS Support
      - Account, Access & Email
      - Endpoint Security Support
      - Data Backup & Migration
      - Printer & Scanner Support
      - I/O & Display Accessories
      
      2. Berikan satu paragraf evaluasi performa yang ringkas dengan bahasa profesional dan bernada apresiatif/positif. Evaluasi harus mencakup:
      - Kekuatan utama engineer (berdasarkan kategori masalah yang paling banyak diselesaikan dan solusinya detail).
      - Area yang perlu ditingkatkan (fokuskan hanya jika ada tiket dengan \`slaRemainingRatio < 0\` atau solusi yang kurang jelas). Dan jika memang ada area yang perlu diperbaiki berikan nomor tiket yang perlu diperbaiki juga
      - Rekomendasi teknis singkat yang membina.
      
      Data Tiket (JSON):
      ${ticketsJson}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tags: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description:
                  'Tepat 3 tag spesialisasi keahlian teknis engineer',
              },
              review: {
                type: Type.STRING,
                description:
                  'Satu paragraf evaluasi performa yang ringkas dengan bahasa profesional mencakup kekuatan utama, area peningkatan, dan rekomendasi teknis singkat.',
              },
            },
            required: ['tags', 'review'],
          },
        },
      });

      if (!response.text) {
        return { tags: [], review: '' };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = JSON.parse(response.text);
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 3) : [],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        review: typeof result.review === 'string' ? result.review : '',
      };
    } catch (error) {
      this.logger.error('Failed to generate analysis from Gemini API', error);
      throw error;
    }
  }

  async generateEngineerTags(ticketsJson: string): Promise<string[]> {
    const analysis = await this.generateEngineerAnalysis('N/A', ticketsJson);
    return analysis.tags;
  }
}
