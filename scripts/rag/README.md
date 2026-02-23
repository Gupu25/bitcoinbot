# Bitcoin Diploma - RAG Dataset

## Descripción
Extracción estructurada del libro de trabajo "Bitcoin Diploma" de My First Bitcoin (El Salvador), optimizada para sistemas RAG (Retrieval Augmented Generation).

## Estructura
- **15 chunks semánticos** organizados por capítulo (1-10)
- **Metadata enriquecida**: categoría, audiencia, conceptos clave
- **Texto optimizado** para embeddings (384 dims con bge-small)

## Categorías
- **fundamentals** (3): Conceptos básicos de dinero y Bitcoin
- **economics** (4): Sistema fiat, banca, inflación, inclusión financiera
- **history** (3): Evolución histórica, cypherpunks
- **technical** (3): Criptografía, mining, UTXO, Lightning
- **practical** (1): Wallets, self-custody, proyecto final
- **philosophy/future** (1): FUD, soberanía financiera, CBDCs

## Uso
Para subir los documentos a tu índice de Upstash Vector:

```bash
# Navegar a la carpeta de scripts
cd scripts/rag

# Instalar dependencias si es necesario (dotenv, @upstash/redis, @upstash/vector)
# npm install dotenv @upstash/redis @upstash/vector

# Ejecutar el script (asegúrate de tener TS-Node instalado)
npx ts-node upload_diploma_to_rag.ts
```

## Fuentes
- **Original**: [My First Bitcoin](https://myfirstbitcoin.io/)
- **Licencia**: Creative Commons BY-SA 4.0
- **Versión**: English | 2024
