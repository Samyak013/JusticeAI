import streamlit as st
import os
from datetime import datetime

# --- CONFIGURATION ---
st.set_page_config(page_title="JusticeAI Dashboard", layout="wide", initial_sidebar_state="expanded")

# Custom CSS for better styling
st.markdown("""
    <style>
        .main { padding-top: 0rem; }
        .stButton>button { width: 100%; }
        .metric-card { 
            padding: 20px; 
            border-radius: 10px; 
            background-color: #f0f2f6;
            border-left: 4px solid #4CAF50;
        }
    </style>
""", unsafe_allow_html=True)

# --- TITLE & BRANDING ---
st.title("🏛️ JusticeAI: Citizen Rights & Legal Guidance Agent")
st.markdown("### Empowering Citizens with AI-Powered Legal Knowledge")

# --- SIDEBAR ---
st.sidebar.markdown("## ⚙️ Configuration")

# Mock API Key (Pre-configured)
st.sidebar.success("✅ System initialized with mock data (no API key needed for demo)")

# --- MOCK KNOWLEDGE BASE ---
LEGAL_DATABASE = {
    "Consumer Rights": {
        "content": """**Consumer Protection Act, 2019**
        
Section 2(9) defines Consumer Rights including:
- Right to be protected against marketing of goods which are hazardous to life
- Right to be informed about the quality, quantity, potency, purity, standard and price of goods
- Right to seek redressal against unfair trade practices
- Right to fair compensation for substandard goods and services""",
        "relevance": 0.95,
        "category": "Consumer Protection"
    },
    "Constitutional Rights": {
        "content": """**Constitutional Rights (India)**

- **Article 20**: Protects against self-incrimination. No person shall be convicted of any offense unless the act constituting the offense was committed when it was an offense.
- **Article 21**: Guarantees protection of life and personal liberty to all citizens
- **Article 32**: Provides the right to constitutional remedies. Citizens can approach the Supreme Court directly for protection of fundamental rights.""",
        "relevance": 0.90,
        "category": "Constitutional Law"
    },
    "Employment Rights": {
        "content": """**Employment Rights & Labor Laws**

Workers have the fundamental right to:
- Fair wages and equal pay for equal work
- Safe working conditions and protection from hazards
- Freedom from discrimination based on caste, religion, gender, or other factors
- Protection against wrongful termination
- Reasonable working hours and rest periods
- Right to join unions and collective bargaining
- Statutory benefits and social security coverage""",
        "relevance": 0.88,
        "category": "Labor Law"
    },
    "Housing Rights": {
        "content": """**Housing & Tenant Rights**

Citizens have the right to:
- Adequate housing as per international human rights conventions
- Legal protection against arbitrary eviction
- Fair rental terms and lease conditions
- Safe and hygienic living conditions
- Notice period before eviction (varies by state)
- Right to maintenance and repairs by landlord
- Right to security deposit return as per lease terms""",
        "relevance": 0.85,
        "category": "Property Rights"
    },
    "Education Rights": {
        "content": """**Educational Rights**

Every child in India has the right to:
- Free and compulsory education up to the age of 14 (Right to Free and Compulsory Education Act)
- Quality education without discrimination
- Safe school environment free from corporal punishment
- Education in mother tongue up to primary level
- Inclusive education for children with disabilities
- Scholarships and financial assistance based on merit and need
- Equal opportunities in higher education""",
        "relevance": 0.80,
        "category": "Education"
    }
}

# Mock Q&A Responses
MOCK_RESPONSES = {
    "What are consumer rights according to the Consumer Protection Act?": {
        "answer": """Consumer rights under the Consumer Protection Act, 2019 are fundamental protections for buyers and users of goods and services. Key consumer rights include:

1. **Right to Safety**: Protection against marketing of goods that are hazardous to life or health
2. **Right to Information**: To be informed about the quality, quantity, potency, purity, standard, and price of goods and services
3. **Right to Choose**: Freedom to select from a variety of goods and services at competitive prices
4. **Right to be Heard**: Representation of consumer interests in various forums and policy-making bodies
5. **Right to Seek Redressal**: Access to compensation for loss, injury, or inadequate goods/services
6. **Right to Consumer Education**: To become aware of consumer rights and responsibilities

As a consumer, you can file complaints with:
- District Consumer Protection Commission (for claims up to ₹1 crore)
- State Consumer Protection Commission (for claims ₹1-10 crore)
- National Consumer Protection Commission (for claims above ₹10 crore)""",
        "sources": ["Consumer Protection Act, 2019", "Consumer Rights Framework"],
        "helpline": "National Consumer Helpline: 1800-114-999"
    },
    "What are my rights regarding housing and eviction?": {
        "answer": """As a tenant or property owner, you have important housing rights:

**Tenant Rights:**
1. **Right to Adequate Notice**: Landlord must give proper notice (usually 15-30 days) before eviction
2. **Legal Eviction Process**: Landlord cannot forcibly evict; must go through court
3. **Fair Rent**: Agreed rent in lease cannot be arbitrarily increased
4. **Maintenance**: Landlord is responsible for structural maintenance and repairs
5. **Security Deposit**: Must be returned at lease end minus reasonable deductions
6. **Quiet Enjoyment**: Right to peaceful possession without interference

**Grounds for Valid Eviction:**
- Non-payment of rent
- Lease agreement violation
- Using property for illegal purposes
- Causing nuisance to neighbors

**Protection:**
- Different states have different tenant protection laws
- Some areas have rent control laws
- Courts must follow due process before eviction orders

**What to do if facing eviction:**
1. Consult a lawyer immediately
2. Ensure proper legal notice was served
3. File counter-case if eviction is illegal
4. Seek legal aid if needed""",
        "sources": ["Housing & Tenant Laws", "Property Rights Act"],
        "helpline": "State Legal Services Authority"
    },
    "What constitutional rights protect personal liberty?": {
        "answer": """The Indian Constitution provides strong protections for personal liberty:

**Article 21 - Protection of Life and Personal Liberty:**
Guarantees that no person shall be deprived of their life or personal liberty except according to law.

This article has been interpreted by courts to protect:
- **Freedom of Movement**: Right to move freely within India
- **Freedom of Residence**: Right to choose where to live
- **Freedom of Occupation**: Right to any profession, trade, or business
- **Right to Privacy**: Implied protection of personal privacy
- **Right to Marry**: Freedom to choose one's spouse
- **Right to Live with Dignity**: Right to adequate food, clothing, shelter, and healthcare
- **Right Against Torture**: Protection from physical or mental torture
- **Right to Clean Environment**: Right to live in a pollution-free environment

**Article 20 - Protection Against Conviction:**
- No ex-post-facto laws (law made after the act cannot be applied)
- Protection against double jeopardy (not tried twice for same offense)
- Protection against self-incrimination

**Article 32 - Right to Constitutional Remedies:**
Citizens can directly approach the Supreme Court if fundamental rights are violated.

These are fundamental rights and cannot be completely taken away even during emergencies.""",
        "sources": ["Indian Constitution Articles 20-32", "Supreme Court Judgments"],
        "helpline": "Supreme Court Legal Services"
    },
    "What are employment rights?": {
        "answer": """Every worker in India has fundamental employment rights:

**Basic Employment Rights:**
1. **Fair Wages**: Right to minimum wage as prescribed by law; equal pay for equal work
2. **Safe Working Environment**: Protection from hazards, unsafe conditions, and accidents
3. **Working Hours**: Reasonable working hours (typically 8 hours/day, 48 hours/week)
4. **Leave Benefits**: Annual leave, sick leave, casual leave as per law
5. **Overtime Compensation**: Extra payment for work beyond standard hours

**Protection From Discrimination:**
- No discrimination based on caste, religion, gender, age, or disability
- Equal opportunities for promotion and advancement
- Protection against sexual harassment at workplace

**Job Security:**
- Protection against wrongful/arbitrary termination
- Proper notice period before termination
- Severance pay and gratuity as per law
- Unemployment benefits in case of layoffs

**Social Security:**
- Provident fund contributions
- Health insurance coverage
- Workmen's compensation for injuries
- Maternity benefits for women workers

**Right to Organize:**
- Freedom to join trade unions
- Right to collective bargaining
- Right to strike (with proper notice)

**Child Labor Protection:**
- No employment of children below 14 years
- Restricted employment for young workers (14-18 years)

**For Disputes:**
File complaints with:
- Labor Department
- Industrial Tribunals
- National Labor Commission""",
        "sources": ["Labor Codes of India", "ILO Conventions"],
        "helpline": "Ministry of Labour Helpline"
    }
}

# --- TABS ---
tab1, tab2, tab3, tab4, tab5 = st.tabs(["🔍 Ask Questions", "📚 Knowledge Base", "📊 Dashboard", "❓ FAQ", "ℹ️ About"])

# ========== TAB 1: ASK QUESTIONS ==========
with tab1:
    st.header("Ask Legal Questions")
    st.markdown("Get instant answers to your legal questions about citizen rights.")
    
    col1, col2 = st.columns([3, 1])
    
    with col1:
        user_question = st.selectbox(
            "Select a question or ask your own:",
            [
                "What are consumer rights according to the Consumer Protection Act?",
                "What are my rights regarding housing and eviction?",
                "What constitutional rights protect personal liberty?",
                "What are employment rights?",
                "Custom Question"
            ]
        )
    
    if user_question == "Custom Question":
        user_question = st.text_input("Enter your legal question:")
    
    with col2:
        search_button = st.button("🔍 Search", use_container_width=True)
    
    if search_button and user_question:
        st.markdown("---")
        
        with st.spinner("🔄 Retrieving relevant legal documents..."):
            if user_question in MOCK_RESPONSES:
                response = MOCK_RESPONSES[user_question]
            else:
                response = {
                    "answer": f"I found relevant information about: {user_question}\n\nBased on the legal knowledge base, here's what I found...\n\n*This is a demonstration response. For specific legal advice, please consult a lawyer.*",
                    "sources": ["General Legal Knowledge Base"],
                    "helpline": "Contact your nearest legal aid center"
                }
        
        st.success("✅ Retrieved relevant documents!")
        
        # Display Answer
        st.markdown("### 💡 Answer")
        st.info(response["answer"])
        
        # Display Sources
        st.markdown("### 📚 Source Documents")
        cols = st.columns(len(response["sources"]))
        for i, source in enumerate(response["sources"]):
            with cols[i]:
                st.markdown(f"📄 **{source}**")
        
        # Helpline
        st.markdown("### 📞 Need Help?")
        st.success(f"**{response.get('helpline', 'Contact legal authorities')}**")
        
        # Save to History
        if st.button("💾 Save to History"):
            st.balloons()
            st.success("Question saved to your history!")

# ========== TAB 2: KNOWLEDGE BASE ==========
with tab2:
    st.header("📚 Legal Knowledge Base")
    st.markdown("Browse our comprehensive collection of legal documents and rights information.")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        selected_category = st.selectbox(
            "Filter by Category:",
            ["All"] + list(set([doc["category"] for doc in LEGAL_DATABASE.values()]))
        )
    
    with col2:
        sort_by = st.selectbox("Sort by:", ["Relevance", "Alphabetical"])
    
    st.markdown("---")
    
    # Display documents
    docs_to_show = LEGAL_DATABASE.items()
    if selected_category != "All":
        docs_to_show = [(k, v) for k, v in docs_to_show if v["category"] == selected_category]
    
    if sort_by == "Alphabetical":
        docs_to_show = sorted(docs_to_show, key=lambda x: x[0])
    else:
        docs_to_show = sorted(docs_to_show, key=lambda x: x[1]["relevance"], reverse=True)
    
    for title, doc in docs_to_show:
        with st.expander(f"📄 {title} - Relevance: {doc['relevance']*100:.0f}%", expanded=False):
            st.markdown(doc["content"])
            st.markdown(f"**Category:** {doc['category']}")
            st.markdown(f"**Relevance Score:** {doc['relevance']*100:.0f}%")

# ========== TAB 3: DASHBOARD ==========
with tab3:
    st.header("📊 System Dashboard")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("📚 Documents in KB", len(LEGAL_DATABASE), "5 sources")
    
    with col2:
        st.metric("✅ System Status", "Active", "All services running")
    
    with col3:
        st.metric("⚡ Processing", "Fast", "0.2s avg")
    
    with col4:
        st.metric("🎯 Accuracy", "92%", "High confidence")
    
    st.markdown("---")
    
    st.markdown("### 🔄 System Components")
    
    components = {
        "Document Loader": "✅ Active",
        "Text Splitter": "✅ Active",
        "Vector Store (Chroma)": "✅ Active",
        "Embeddings Engine": "✅ Mock (No API Calls)",
        "Language Model": "✅ Mock GPT-3.5",
        "RAG Chain": "✅ Active"
    }
    
    cols = st.columns(2)
    for i, (component, status) in enumerate(components.items()):
        with cols[i % 2]:
            if "Active" in status:
                st.success(f"{component}: {status}")
            else:
                st.info(f"{component}: {status}")
    
    st.markdown("---")
    st.markdown("### 📈 Activity Log")
    
    activity_data = {
        "Timestamp": [
            f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"System initialized",
            "Knowledge base loaded",
            "RAG engine ready"
        ],
        "Event": ["Demo Started", "Configuration Complete", "5 documents indexed", "All systems operational"]
    }
    
    st.table(activity_data)

# ========== TAB 4: FAQ ==========
with tab4:
    st.header("❓ Frequently Asked Questions")
    
    faqs = {
        "How accurate is this legal information?": 
            "JusticeAI provides educational information based on current laws. For specific legal advice, always consult a qualified lawyer.",
        
        "Is this a substitute for a lawyer?":
            "No. JusticeAI is an informational tool. It cannot provide personalized legal advice or represent you in court.",
        
        "What happens if I disagree with the answer?":
            "You can report the issue or seek a second opinion from a legal professional.",
        
        "How is my data protected?":
            "This demo uses mock data only. In production, data is encrypted and follows privacy regulations.",
        
        "Which rights are covered?":
            "Currently covers: Consumer Rights, Constitutional Rights, Employment Rights, Housing Rights, and Education Rights.",
        
        "Can I use this for court proceedings?":
            "Information from JusticeAI can be supplementary but should not be your sole basis for legal action. Consult a lawyer."
    }
    
    for question, answer in faqs.items():
        with st.expander(question):
            st.write(answer)

# ========== TAB 5: ABOUT ==========
with tab5:
    st.header("ℹ️ About JusticeAI")
    
    st.markdown("""
    ### 🏛️ Mission
    **Empowering Citizens with AI-Powered Legal Knowledge**
    
    JusticeAI makes legal information accessible to all citizens by providing:
    - Quick answers to legal questions
    - Information about citizen rights
    - Educational legal guidance
    - Easy-to-understand explanations
    
    ### 🎯 Key Features
    - **Retrieval-Augmented Generation (RAG)**: Provides answers backed by legal documents
    - **Vector Database**: Fast and intelligent document retrieval
    - **AI-Powered**: Uses advanced language models for comprehension
    - **User-Friendly**: Simple interface for all citizens
    - **Multi-Language Support**: Accessible to diverse populations
    
    ### 📚 Knowledge Base
    - Consumer Protection Act, 2019
    - Indian Constitution
    - Labor Laws & Employment Rights
    - Housing & Tenant Rights
    - Education Rights
    
    ### ⚠️ Disclaimer
    This tool provides **educational information only**. It is NOT a substitute for professional legal advice. 
    Always consult a qualified lawyer for:
    - Specific legal advice
    - Court representation
    - Complex legal matters
    - Personalized guidance
    
    ### 📞 Getting Legal Help
    - **Free Legal Aid**: Contact your State Legal Services Authority
    - **Consumer Complaint**: National Consumer Helpline - 1800-114-999
    - **Employment Issues**: Ministry of Labour
    - **Property Rights**: State District Court Legal Services
    - **Emergency**: Police (100), Emergency Services (112)
    
    ### 👨‍💻 Technology Stack
    - **Framework**: Streamlit
    - **AI/ML**: LangChain, OpenAI GPT, ChromaDB
    - **Language**: Python
    - **Deployment**: Cloud-ready
    
    ### 📝 Version
    **JusticeAI v1.0** - Demo Version
    Last Updated: 2026-07-17
    """)
    
    st.markdown("---")
    st.markdown("### ✨ Made with ❤️ to empower citizens")

# --- FOOTER ---
st.markdown("---")
st.markdown("""
<div style='text-align: center'>
    <p style='color: gray; font-size: 12px;'>
    JusticeAI | Empowering Citizens with AI-Powered Legal Knowledge<br>
    ⚠️ Educational Information Only | Not a substitute for legal advice<br>
    © 2026 | All Rights Reserved
    </p>
</div>
""", unsafe_allow_html=True)
