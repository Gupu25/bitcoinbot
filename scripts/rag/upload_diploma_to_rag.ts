import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Definir __dirname para compatibilidad con ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Configuración
const BATCH_SIZE = 100;

// Inicializar clientes
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

interface RagDocument {
    id: string;
    text: string;
    metadata: {
        source: string;
        chapter: number;
        title: string;
        category: string;
        key_concepts: string[];
        target_audience: string;
        [key: string]: any;
    };
}

async function loadDocuments(filePath: string): Promise<RagDocument[]> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.trim().split('\n');
    return lines.map(line => JSON.parse(line));
}

async function uploadToVectorDB() {
    console.log('🚀 Iniciando carga de Bitcoin Diploma a Upstash Vector...');

    const jsonlPath = path.join(__dirname, 'bitcoin_diploma_rag.jsonl');

    try {
        if (!fs.existsSync(jsonlPath)) {
            throw new Error(`No se encontró el archivo: ${jsonlPath}`);
        }

        // Cargar documentos
        const docs = await loadDocuments(jsonlPath);
        console.log(`📚 ${docs.length} documentos cargados desde JSONL`);

        // Procesar en batches
        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            const batch = docs.slice(i, i + BATCH_SIZE);

            // Upsert a Upstash Vector
            await index.upsert(
                batch.map(doc => ({
                    id: doc.id,
                    data: doc.text,
                    metadata: doc.metadata
                }))
            );

            console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)} subido`);
        }

        // Guardar metadatos en Redis para referencia
        await redis.set('rag:bitcoin_diploma:info', JSON.stringify({
            total_chunks: docs.length,
            source: 'Bitcoin Diploma - My First Bitcoin (El Salvador)',
            uploaded_at: new Date().toISOString(),
            categories: Array.from(new Set(docs.map(d => d.metadata.category))),
            chapters: Array.from(new Set(docs.map(d => d.metadata.chapter))).sort((a, b) => a - b)
        }));

        console.log('🎉 ¡Carga completada exitosamente!');
        console.log('📊 Resumen:');
        console.log(`   - Documentos: ${docs.length}`);
        console.log(`   - Capítulos: ${Array.from(new Set(docs.map(d => d.metadata.chapter))).join(', ')}`);
        console.log(`   - Categorías: ${Array.from(new Set(docs.map(d => d.metadata.category))).join(', ')}`);

    } catch (error) {
        console.error('❌ Error en carga:', error);
        process.exit(1);
    }
}

// Ejecutar
uploadToVectorDB();
