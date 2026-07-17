import { AgentInfo, LegalAnalysis } from "./types";

export const LEGAL_CATEGORIES = [
  { 
    id: "housing", 
    name: "Tenant & Housing Rights", 
    icon: "Home", 
    placeholder: "Landlord kept deposit, eviction notice, unsafe living conditions, or RERA delay in possession of flat..." 
  },
  { 
    id: "labor", 
    name: "Labor & Employment", 
    icon: "Briefcase", 
    placeholder: "Unpaid salary, gratuity denial, wage theft, wrongful termination, or PF/Gratuity claim issues..." 
  },
  { 
    id: "consumer", 
    name: "Consumer Protection", 
    icon: "ShoppingBag", 
    placeholder: "Defective device refund refusal, misleading advertisement, fake warranty, or consumer court disputes..." 
  },
  { 
    id: "civil", 
    name: "Civil Liberties", 
    icon: "Scale", 
    placeholder: "Freedom of expression, privacy violation, unauthorized data tracking/Aadhaar leak, or public discrimination..." 
  },
  { 
    id: "general", 
    name: "General Civil Issues", 
    icon: "ShieldAlert", 
    placeholder: "Small claims contract breaches, housing society disputes, neighborhood noise complaints, or municipal issues..." 
  }
];

export interface SampleCase {
  title: string;
  category: string;
  location: string;
  language: string;
  description: string;
  analysis: LegalAnalysis;
}

export const SAMPLE_CASES: SampleCase[] = [
  {
    title: "RERA Flat Possession Delay (Pune, India)",
    category: "housing",
    location: "Pune, Maharashtra, India",
    language: "Marathi",
    description: "मी पुणे येथे एका नामांकित बिल्डरकडून फ्लॅट बुक केला होता. करारानुसार ताबा डिसेंबर २०२५ पूर्वी मिळणे अपेक्षित होते. अजूनही बांधकाम अपूर्ण आहे आणि बिल्डर काहीही उत्तर देत नाही. मला भरलेल्या रकमेवर व्याज किंवा नुकसानभरपाई हवी आहे.",
    analysis: {
      researcher: {
        findings: "महाराष्ट्र स्थावर संपदा (नियमन आणि विकास) अधिनियम, २०१६ (MahaRERA) च्या कलम १८ नुसार, जर प्रवर्तक (बिल्डर) विक्री करारात नमूद केलेल्या मुदतीत सदनिकेचा (फ्लॅट) ताबा देण्यास असमर्थ ठरला, तर खरेदीदार स्वतःच्या इच्छेनुसार प्रकल्पातून बाहेर पडून भरलेली सर्व रक्कम व्याजासह परत मिळवण्यास किंवा ताबा मिळेपर्यंत दरमहा व्याज मिळवण्यास पात्र आहे. पुणे जिल्हा महारेरा न्यायाधिकरणाने विलंबाच्या कालावधीसाठी आरबीआयच्या कर्ज दरापेक्षा २% जास्त दराने (अंदाजे १०.२% प्रतिवर्ष) व्याज देण्याचे अनेक आदेश बिल्डरला दिले आहेत.",
        statutes: [
          "स्थावर संपदा (नियमन आणि विकास) अधिनियम, २०१६ (RERA) - कलम १८",
          "महाराष्ट्र स्थावर संपदा नियम, २०१७ - नियम १८ आणि १९",
          "ग्राहक संरक्षण कायदा, २०१९ - कलम २(११) (सेवेतील त्रुटी)"
        ],
        sources: [
          { title: "MahaRERA Official Website Portal", uri: "https://maharera.maharashtra.gov.in" },
          { title: "RERA Act 2016 Central Gazette Section 18", uri: "https://maharera.maharashtra.gov.in/files/maharera_act_2016.pdf" }
        ]
      },
      explainer: {
        summary: "पुण्यातील किंवा महाराष्ट्रातील आपल्या फ्लॅटचा ताबा मिळण्यास विलंब झाल्यामुळे तुम्हाला बिल्डरकडून विलंबाच्या कालावधीचे व्याज किंवा संपूर्ण भरलेली रक्कम व्याजासह परत मिळवण्याचा पूर्ण कायदेशीर हक्क आहे. महारेरा अंतर्गत तुम्ही आपले हक्क सुरक्षित करू शकता.",
        keyRights: [
          "**विलंब व्याज मिळवण्याचा अधिकार**: ताबा मिळण्यास झालेल्या विलंबाच्या प्रत्येक महिन्यासाठी आरबीआयच्या कर्ज दरापेक्षा २% जास्त दराने (अंदाजे १०.२% प्रतिवर्ष) व्याज मिळवणे.",
          "**पूर्ण परताव्याचा अधिकार**: जर तुम्हाला करार रद्द करायचा असेल, तर भरलेली संपूर्ण रक्कम व्याजासह परत मिळवणे.",
          "**तक्रार दाखल करण्याचा अधिकार**: विलंबाविरुद्ध थेट महारेरा न्यायाधिकरणाकडे अधिकृत तक्रार (Form M) दाखल करणे."
        ],
        actionSteps: [
          "नोंदणीकृत विक्री कराराची (Agreement for Sale) प्रमाणित प्रत गोळा करा.",
          "बिल्डरला ऑनलाइन किंवा बँकेद्वारे केलेल्या सर्व पेमेंटच्या पावत्या आणि बँक स्टेटमेंट तयार ठेवा.",
          "बिल्डरला महारेरा कलम १८ अंतर्गत विलंबाचे व्याज किंवा परतावा मागण्यासाठी कायदेशीर नोटीस पाठवा.",
          "जर बिल्डरने प्रतिसाद दिला नाही, तर महारेरा पोर्टलवर तक्रार दाखल करा."
        ]
      },
      recommendation: {
        authorityName: "महाराष्ट्र स्थावर संपदा नियामक प्राधिकरण (MahaRERA) न्यायाधिकरण, पुणे विभाग",
        reasoning: "पुणे आणि महाराष्ट्रातील रिअल इस्टेट क्षेत्रातील सर्व वाद महारेरा प्राधिकरणाद्वारे जलद गतीने सोडवले जातात. ग्राहक न्यायालयाच्या तुलनेत येथे लवकर निर्णय मिळतो आणि बिल्डरवर दबाव निर्माण होतो.",
        contactDetails: "पत्ता: महारेरा पुणे कार्यालय, नवीन प्रशासकीय इमारत, शिवजीनगर, पुणे. वेबसाइट: https://maharera.maharashtra.gov.in",
        procedure: "१. महारेराच्या अधिकृत संकेतस्थळाला भेट द्या.\n२. 'तक्रार नोंदणी' (Form M) निवडा आणि तुमची माहिती भरा.\n३. तक्रार फी ₹५,००० ऑनलाइन भरा.\n४. कराराची प्रत आणि पुराव्यांची कागदपत्रे अपलोड करा.\n५. बिल्डरला तक्रारीची प्रत पाठवून सुनावणीला हजर रहा."
      },
      generator: {
        letterTitle: "महारेरा कायदा २०१६ च्या कलम १८ अंतर्गत फ्लॅटचा ताबा मिळण्यास विलंब झाल्याबद्दल बिल्डरला कायदेशीर नोटीस",
        letterBody: "प्रति,\n[Recipient Name]\n[बिल्डरचे नाव/पत्ता]\n\nविषय: महारेरा कायदा २०१६ च्या कलम १८ अन्वये विलंबाचे व्याज आणि नुकसानभरपाई मिळणेबाबत नोटीस\n\nमहोदय,\n\nमी, [Your Name], पुणे येथील आपल्या प्रकल्पात फ्लॅट बुक केला आहे. करारानुसार ताबा डिसेंबर २०२५ पूर्वी मिळणे अपेक्षित होते. मी आत्तापर्यंत एकूण [Amount] रक्कम भरली आहे. परंतु, अजूनही बांधकाम अपूर्ण आहे आणि ताबा देण्यात आलेला नाही.\n\nया नोटीसीद्वारे मी आपणास विनंती करतो की महारेरा कलम १८ नुसार झालेल्या विलंबाबद्दल मला व्याजाची रक्कम अदा करावी किंवा संपूर्ण रकमेचा परतावा द्यावा, अन्यथा मी महारेरा न्यायाधिकरणाकडे कायदेशीर तक्रार दाखल करेन.\n\nआपला नम्र,\n\n[Your Name]",
        instructions: "ही नोटीस बिल्डरच्या अधिकृत ईमेल पत्त्यावर आणि नोंदणीकृत पत्त्यावर आर.पी.ए.डी. (RPAD) पोस्टाद्वारे पाठवा. पोस्टाची पावती पुरावा म्हणून जपून ठेवा."
      }
    }
  },
  {
    title: "Consumer Mobile Refund Denied (Mumbai, India)",
    category: "consumer",
    location: "Mumbai, Maharashtra, India",
    language: "Hindi",
    description: "मैंने मुंबई के एक इलेक्ट्रॉनिक स्टोर से ₹४५,००० का नया स्मार्टफोन खरीदा। फोन ७ दिनों के भीतर बार-बार रीस्टार्ट होने लगा। स्टोर मालिक ने सर्विस सेंटर जाने को कहा, और सर्विस सेंटर ने रिप्लेसमेंट या रिफंड देने से साफ मना कर दिया।",
    analysis: {
      researcher: {
        findings: "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत, किसी भी ग्राहक को त्रुटिपूर्ण उत्पाद (Defective Product) के लिए रिप्लेसमेंट या रिफंड पाने का पूर्ण अधिकार है। यदि कोई इलेक्ट्रॉनिक उपकरण खरीदने के 15 दिनों के भीतर खराब हो जाता है, तो विक्रेता उसे 'सर्विस सेंटर जाने' के लिए बाध्य नहीं कर सकता; यह 'अनुचित व्यापार प्रथा' (Unfair Trade Practice) के अंतर्गत आता है। विक्रेता ब्रांड सर्विस सेंटर की आड़ में रिफंड से मना नहीं कर सकता।",
        statutes: [
          "उपभोक्ता संरक्षण अधिनियम, 2019 - धारा 2(47) (अनुचित व्यापार प्रथा)",
          "भारतीय अनुबंध अधिनियम, 1872 - धारा 73",
          "उपभोक्ता संरक्षण (ई-कॉमर्स) नियम, 2020"
        ],
        sources: [
          { title: "National Consumer Disputes Redressal Commission Portal", uri: "https://ncdrc.nic.in" },
          { title: "e-Daakhil Consumer E-Filing System", uri: "https://edaakhil.nic.in" }
        ]
      },
      explainer: {
        summary: "यदि खरीदा गया मोबाइल 7 दिनों में खराब हो जाता है, तो कानूनन स्टोर मालिक आपको सीधे रिफंड या रिप्लेसमेंट देने के लिए उत्तरदायी है। वे आपको सर्विस सेंटर भेजकर अपनी जिम्मेदारी से बच नहीं सकते।",
        keyRights: [
          "**त्रुटिमुक्त उत्पाद का अधिकार**: खराबी आने पर रिप्लेसमेंट या पूरा रिफंड पाने का अधिकार।",
          "**निवारण का अधिकार**: अनुचित व्यापार प्रथाओं के खिलाफ शिकायत दर्ज करने और मुआवजा पाने का अधिकार।",
          "**उत्पाद दायित्व**: निर्माता और विक्रेता दोनों ही त्रुटिपूर्ण उत्पाद के नुकसान के लिए जिम्मेदार हैं।"
        ],
        actionSteps: [
          "दुकानदार से लिखित में रिफंड से इनकार का कारण मांगें या उन्हें ईमेल भेजें।",
          "खरीदारी का बिल (Invoice) और फोन की खराबी का वीडियो रिकॉर्डिंग संभाल कर रखें।",
          "स्टोर मैनेजर को उपभोक्ता संरक्षण अधिनियम के तहत 7 दिनों का नोटिस भेजें।",
          "राष्ट्रीय उपभोक्ता हेल्पलाइन (NCH) 1915 पर कॉल करें या शिकायत दर्ज करें।"
        ]
      },
      recommendation: {
        authorityName: "जिला उपभोक्ता विवाद निवारण आयोग (Consumer Forum), मुंबई",
        reasoning: "उपभोक्ता फोरम सीधे उपभोक्ताओं के अधिकारों की रक्षा करता है और विक्रेताओं पर जुर्माना लगाने की शक्ति रखता है।",
        contactDetails: "वेबसाइट: https://edaakhil.nic.in / टोल-फ्री हेल्पलाइन: 1915 / जिला कार्यालय: बांद्रा, मुंबई।",
        procedure: "1. 'e-Daakhil' पोर्टल पर जाकर लॉग इन करें।\n2. विक्रेता और निर्माता के खिलाफ शिकायत दर्ज करें।\n3. बिल, वारंटी कार्ड और खराबी के सबूत अपलोड करें।\n4. नाममात्र की फीस का भुगतान करें।\n5. बिना वकील के खुद अपना पक्ष रखें।"
      },
      generator: {
        letterTitle: "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत खराब मोबाइल के रिफंड/रिप्लेसमेंट के लिए कानूनी नोटिस",
        letterBody: "सेवा में,\n[Recipient Name]\n[स्टोर का नाम/पता]\n\nविषय: खराब मोबाइल फोन के लिए पूर्ण रिफंड या रिप्लेसमेंट की मांग।\n\nमहोदय,\n\nमैं, [Your Name], ने दिनांक [Date] को आपके स्टोर से ₹45,000 की राशि देकर एक नया स्मार्टफोन खरीदा था (इनवॉइस नंबर: [Invoice]). खरीद के मात्र 7 दिनों के भीतर फोन बार-बार रीस्टार्ट होने लगा, जो कि एक गंभीर विनिर्माण दोष है।\n\nआपके द्वारा रिफंड से इनकार करना उपभोक्ता अधिकारों का उल्लंघन है। मैं मांग करता हूँ कि आप 7 दिनों के भीतर मुझे नया फोन दें या [Amount] की पूरी राशि वापस करें।\n\nभवदीय,\n\n[Your Name]",
        instructions: "इस नोटिस को स्टोर के ईमेल पर भेजें और एक प्रति स्पीड पोस्ट से भेजें। पोस्टल पावती रसीद सुरक्षित रखें।"
      }
    }
  },
  {
    title: "Unpaid Salary & IT Gratuity (Bengaluru, India)",
    category: "labor",
    location: "Bengaluru, Karnataka, India",
    language: "English",
    description: "I worked as a software engineer at a startup in Bengaluru for 2.5 years. The company terminated my employment with 1-day notice and has withheld my last 3 months of salary (amounting to ₹2,40,000) and refused my legitimate severance pay.",
    analysis: {
      researcher: {
        findings: "Under employment regulations (such as the Payment of Wages Act, 1936, and the Karnataka Shops and Commercial Establishments Act, 1961), withholding earned salary after termination of employment is strictly illegal. Employers are required to settle all pending wages, severance, and statutory gratuity within 48 hours to 7 days of termination. Unilateral termination without contractually agreed notice pay also entitles the employee to notice period salary.",
        statutes: [
          "The Payment of Wages Act, 1936 - Section 5 (Time of Payment of Wages)",
          "Karnataka Shops and Commercial Establishments Act, 1961 - Section 30",
          "The Payment of Gratuity Act, 1972"
        ],
        sources: [
          { title: "Karnataka State Labor Department Portal", uri: "https://labour.karnataka.gov.in" },
          { title: "Ministry of Labour & Employment India Central Rules", uri: "https://labour.gov.in" }
        ]
      },
      explainer: {
        summary: "Your employer cannot legally withhold your earned salary, gratuity, or contractually mandated severance pay upon termination. Any attempt to lock away your salary is a severe violation of labor statutes, and they can be ordered to pay hefty interest penalties.",
        keyRights: [
          "**Right to Full Wages**: Receive complete payment for all days worked without unauthorized deductions.",
          "**Notice Pay Protection**: Right to receive notice period pay (e.g., 1-3 months) as specified in the employment agreement.",
          "**Statutory Severance & Gratuity**: Right to receive accumulated gratuity benefits and severance compensation for continuous service."
        ],
        actionSteps: [
          "Download all salary slips, bank transaction logs, and your signed employment contract.",
          "Keep copies of the termination letter/email and any correspondence regarding unpaid dues.",
          "Send a strong legal notice demanding immediate settlement of all outstanding dues.",
          "Submit a formal petition to the regional Labor Commissioner if unpaid after 10 days."
        ]
      },
      recommendation: {
        authorityName: "Office of the Regional Labor Commissioner / Labor Inspector, Bengaluru East/West",
        reasoning: "The Labor Commissioner enforces statutory wage payments and has executive powers to issue recovery citations to employers.",
        contactDetails: "State Labor Department Portal: https://labour.karnataka.gov.in / Office: Karmika Bhavan, Bannerghatta Road, Bengaluru.",
        procedure: "1. Draft a petition detailing your employment history, pending salary, and termination.\n2. Submit the petition to the local Labor Inspector's office.\n3. The inspector will issue a summons to the company management to attend joint conciliation.\n4. If unresolved, the case is referred to the Labor Court for recovery orders."
      },
      generator: {
        letterTitle: "Legal Demand Notice for Unpaid Salary, Severance, and Settlement of Dues",
        letterBody: "To,\n[Recipient Name]\n[Company Name/Address]\n\nRE: Formal Demand for Immediate Payment of Withheld Salary and Notice Pay.\n\nDear Sir/Madam,\n\nI, [Your Name], worked as an employee at your firm. On [Date], my employment was summarily terminated with only 1-day notice. My earned salary for the last 3 months totaling [Amount], along with my notice period pay, remains withheld.\n\nThis withholding is a direct violation of the Payment of Wages Act. Please credit my bank account with the full amount of [Amount] within 7 days, or I will proceed with filing a formal recovery case before the Labor Commissioner.\n\nSincerely,\n\n[Your Name]",
        instructions: "Send this notice to the HR department and the company directors via corporate email and speed post. Request an read-receipt."
      }
    }
  },
  {
    title: "Tenant Security Deposit Return (California, USA)",
    category: "housing",
    location: "California, USA",
    language: "English",
    description: "I moved out of my apartment 30 days ago. My landlord has not returned my security deposit of $1,500 or given me any itemized list of deductions. They are ignoring my text messages and emails.",
    analysis: {
      researcher: {
        findings: "Under California Civil Code Section 1950.5, a landlord is strictly required to return a tenant's security deposit or provide an itemized statement of deductions, along with copies of receipts for any repairs exceeding $125, within 21 calendar days after vacating. Landlords who withhold a deposit in bad faith can be held liable for statutory treble damages of up to twice the amount of the deposit, plus actual damages.",
        statutes: [
          "California Civil Code Section 1950.5 (Security Deposits)",
          "California Civil Code Section 1941.1 (Implied Warranty of Habitability)",
          "California Code of Civil Procedure Section 116.220 (Small Claims Jurisdiction)"
        ],
        sources: [
          { title: "California Courts Self-Help Guide to Security Deposits", uri: "https://selfhelp.courts.ca.gov/guide-security-deposits" },
          { title: "California Legislative Information Code Section 1950.5", uri: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=1950.5.&lawCode=CIV" }
        ]
      },
      explainer: {
        summary: "Your landlord is prohibited from withholding your security deposit for arbitrary repairs or without providing a written, itemized breakdown with receipts. If they fail to meet the strict 21-day deadline, they lose the legal right to claim any deductions at all.",
        keyRights: [
          "**Right to 21-Day Settlement**: Complete return of deposit or itemized deductions list within 21 calendar days.",
          "**No 'Wear and Tear' Deductions**: Deductions are only permitted for damage exceeding ordinary wear and tear.",
          "**Bad Faith Compensation**: Right to sue for twice the deposit amount in statutory damages for bad-faith withholding."
        ],
        actionSteps: [
          "Gather check-in and check-out photos, repair requests, and copies of your written notice of intent to vacate.",
          "Calculate the exact amount withheld and review the itemized deductions if any.",
          "Draft a formal security deposit demand letter citing California Civil Code Section 1950.5.",
          "File a plaintiff's claim in Small Claims Court if the landlord refuses to refund the deposit within 14 days."
        ]
      },
      recommendation: {
        authorityName: "California County Small Claims Court / Municipal Rent Board",
        reasoning: "Small Claims courts are designed for rapid, low-cost resolution of residential tenant-landlord financial disputes under $12,500 without attorney representation.",
        contactDetails: "Contact your local county courthouse clerk or visit the California Courts online self-help portal.",
        procedure: "1. Complete Form SC-100 (Plaintiff's Claim and Order to Go to Small Claims Court).\n2. File with your county court clerk and pay the minor filing fee ($30-$75).\n3. Serve the landlord with a copy of the claim through a professional server or sheriff.\n4. Attend the court hearing with printed photo printouts, receipts, and communication logs."
      },
      generator: {
        letterTitle: "Formal Demand Letter for Return of Security Deposit (Cal. Civil Code § 1950.5)",
        letterBody: "To,\n[Recipient Name]\n[Landlord Name/Address]\n\nRE: Formal Demand for Return of Security Deposit under Cal. Civil Code § 1950.5.\n\nDear Landlord,\n\nI, [Your Name], vacated my tenancy at your property on [Date]. I have received neither my security deposit of [Amount] nor an itemized list of deductions with receipts as strictly required under California Civil Code Section 1950.5.\n\nAs 21 days have passed since I vacated, you have forfeited your right to retain any portion of my deposit. Please return the full amount of [Amount] to me within 10 days, or I will file an action in Small Claims Court to recover the deposit plus bad-faith statutory damages.\n\nSincerely,\n\n[Your Name]",
        instructions: "Send this demand letter via Certified Mail with Return Receipt Requested. Keep the postal tracking record for court."
      }
    }
  },
  {
    title: "Defective Electronic Refund UK",
    category: "consumer",
    location: "London, UK",
    language: "English",
    description: "I purchased a high-end laptop for £1,200 from a retail store. The motherboard failed within 14 days of purchase. The store refuses to give me a refund, claiming that all sales are final once opened.",
    analysis: {
      researcher: {
        findings: "Under the Consumer Rights Act 2015, goods must be of satisfactory quality, fit for purpose, and as described. If a product develops a serious defect within 30 days, the customer has an absolute statutory 'short-term right to reject' the product and obtain a full refund without any deductions. The retailer cannot force the consumer to accept a repair or a store credit instead.",
        statutes: [
          "Consumer Rights Act 2015 (UK) - Sections 9, 10 & 20",
          "Sale of Goods Guidelines on Implied Warranty of Merchantability",
          "Trading Standards Consumer Protection Directives"
        ],
        sources: [
          { title: "UK Government Consumer Protection Rights", uri: "https://www.gov.uk/consumer-protection-rights" },
          { title: "Citizens Advice UK Faulty Goods Guide", uri: "https://www.citizensadvice.org.uk/consumer/something-goes-wrong-with-a-purchase/rejecting-faulty-goods/" }
        ]
      },
      explainer: {
        summary: "You are legally entitled to receive products that function perfectly as advertised. When a device fails in the first 30 days, the retailer is legally obliged to credit your purchase price back. No repair cycle loops or store credit substitutions can be forced upon you.",
        keyRights: [
          "**Short-term Right to Reject**: Reject inherently faulty goods within 30 days of purchase for a 100% refund.",
          "**Right to Direct Store Remedy**: The retailer (not the manufacturer) is liable to resolve your dispute directly.",
          "**Satisfactory Quality Protection**: Protection ensuring any device functions normally for its expected lifespan."
        ],
        actionSteps: [
          "Preserve your receipts, invoices, packaging materials, and delivery notes.",
          "Document the product defect with photos or a clear short video.",
          "Send a written 'Letter of Rejection' citing the Consumer Rights Act directly to the store management.",
          "Contact your credit card issuer to initiate a chargeback dispute if paid electronically."
        ]
      },
      recommendation: {
        authorityName: "Trading Standards Office / Civil Small Claims Court UK",
        reasoning: "Trading Standards regulates retail stores for unfair practices, while the Small Claims Court enforces your financial right to a cash refund.",
        contactDetails: "Contact Citizens Advice Consumer Helpline at 0808 223 1133 or visit their online help desk.",
        procedure: "1. Draft a chronological list of events, purchases, and refund requests.\n2. Submit a formal query to Citizens Advice or local consumer protection agent.\n3. If unpaid, file a simple small claim online (Money Claim Online in the UK).\n4. Submit photos, letters, and invoices as proof for judge review."
      },
      generator: {
        letterTitle: "Formal Notice of Rejection and Request for Refund of Defective Device",
        letterBody: "To,\n[Recipient Name]\n[Retail Company Name/Address]\n\nRE: Formal Rejection of Defective Goods and Request for Refund.\n\nDear Store Manager,\n\nI, [Your Name], purchased an electronic device from your store on [Date] for [Amount]. Within several days, the device developed a severe malfunction rendering it unfit for purpose.\n\nUnder applicable consumer rights laws, I am exercising my statutory right to reject these goods due to inherent manufacturing defects. Please credit my original payment method with the sum of [Amount] within 7 days, or I shall proceed with formal chargeback and small claims filing.\n\nSincerely,\n\n[Your Name]",
        instructions: "Deliver this by email and hand it over to the store counter. Ask for a stamped duplicate copy."
      }
    }
  }
];

export const AGENTS_LIST: AgentInfo[] = [
  {
    id: "researcher",
    name: "Legal Research Agent",
    role: "Statute Analyzer & Grounded Searcher",
    description: "Uses Google Search to identify real-time laws, local regulations, civil codes, and court precedents specific to your location.",
    avatar: "🕵️‍♂️",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900",
    iconName: "SearchCode"
  },
  {
    id: "explainer",
    name: "Rights Explainer Agent",
    role: "Legal-to-Layman Translator",
    description: "Simplifies dense legal texts into easy, supportive, layman-friendly summaries, key civil rights checklists, and concrete steps.",
    avatar: "💡",
    bgColor: "bg-teal-50 dark:bg-teal-950/20",
    borderColor: "border-teal-200 dark:border-teal-900",
    iconName: "FileText"
  },
  {
    id: "recommendation",
    name: "Authority Recommendation Agent",
    role: "Filing Venue & Ombuds Specialist",
    description: "Identifies the exact government office, consumer court, rent board, or commissioner to file your complaint with, listing procedural guides.",
    avatar: "🏛️",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    borderColor: "border-indigo-200 dark:border-indigo-900",
    iconName: "Landmark"
  },
  {
    id: "generator",
    name: "Document Generator Agent",
    role: "Demand Letter & Dispute Composer",
    description: "Drafts robust, formal, and citation-backed Demand Letters, Disputes, or Grievances tailored with custom placeholders for your case.",
    avatar: "✍️",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    borderColor: "border-rose-200 dark:border-rose-900",
    iconName: "PenTool"
  }
];
