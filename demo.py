#!/usr/bin/env python3
"""
JusticeAI Demo - Legal Q&A System
Run this script to see the JusticeAI system in action
"""

import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

# Set your OpenAI API key
os.environ["OPENAI_API_KEY"] = "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"

print("\n" + "="*70)
print("🏛️  JusticeAI Demo - Legal Q&A with RAG")
print("="*70)

# ========== Step 1: Load Documents ==========
print("\n📄 Step 1: Loading Legal Documents...")
data_dir = "data"
doc_path = os.path.join(data_dir, "legal_document.txt")

if not os.path.exists(doc_path):
    os.makedirs(data_dir, exist_ok=True)
    with open(doc_path, "w") as f:
        f.write("""Consumer Protection Act, 2019: Section 2(9) defines Consumer Rights including the right to be protected against marketing of goods which are hazardous to life; the right to be informed about the quality, quantity, potency, purity, standard and price of goods; the right to seek redressal against unfair trade practices.

Constitutional Rights (India): Article 20 protects against self-incrimination. Article 21 guarantees protection of life and personal liberty. Article 32 provides the right to constitutional remedies.

Employment Rights: Workers have the right to fair wages, safe working conditions, and freedom from discrimination. Labor laws protect against wrongful termination and ensure minimum wage standards.

Housing Rights: Citizens have the right to adequate housing as per international human rights conventions. Tenants have legal protection against arbitrary eviction.

Education Rights: Every child has the right to free and compulsory education up to the age of 14. No discrimination in educational institutions.""")
    print(f"  ✅ Created {doc_path}")
else:
    print(f"  ✅ Using existing {doc_path}")

loader = TextLoader(doc_path)
documents = loader.load()
print(f"  ✅ Loaded {len(documents)} document(s)")

# ========== Step 2: Split Documents ==========
print("\n🔄 Step 2: Splitting Documents into Chunks...")
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(documents)
print(f"  ✅ Created {len(chunks)} chunks")

# ========== Step 3: Create Embeddings ==========
print("\n🧠 Step 3: Creating Embeddings...")
try:
    embeddings = OpenAIEmbeddings()
    print("  ✅ OpenAI embeddings model initialized")
except Exception as e:
    print(f"  ❌ Error: {e}")
    print("  Make sure your OpenAI API key is valid!")
    exit(1)

# ========== Step 4: Create Vector Store ==========
print("\n🗄️  Step 4: Building Vector Store...")
persist_directory = "./.chroma_db"
vector_store = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory=persist_directory
)
print(f"  ✅ Vector store created in {persist_directory}")

# ========== Step 5: Setup RAG Chain ==========
print("\n⚙️  Step 5: Setting up RAG QA Chain...")
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.7)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)
print("  ✅ RAG QA Chain ready!")

# ========== Step 6: Ask Questions ==========
print("\n" + "="*70)
print("💬 Asking Legal Questions...")
print("="*70)

questions = [
    "What are consumer rights according to the Consumer Protection Act?",
    "What are my rights regarding housing and eviction?",
    "What constitutional rights protect personal liberty?",
    "What are employment rights?"
]

for i, question in enumerate(questions, 1):
    print(f"\n[Question {i}] ❓ {question}")
    print("-" * 70)
    
    result = qa_chain.invoke({"query": question})
    
    print(f"\n💡 Answer:")
    print(result['result'])
    
    print(f"\n📚 Source Documents Used:")
    for j, doc in enumerate(result['source_documents'], 1):
        preview = doc.page_content[:100].replace('\n', ' ')
        print(f"   [{j}] {preview}...")

print("\n" + "="*70)
print("✅ Demo Complete! JusticeAI is working correctly.")
print("="*70 + "\n")
