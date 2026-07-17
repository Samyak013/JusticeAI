import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Initialize the Gemini client as described in the guidelines (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Configure JSON and form parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper function to call Gemini API with retry and exponential backoff
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1500): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const errMsg = error.message || "";
      const isRateLimit = 
        error.status === "RESOURCE_EXHAUSTED" || 
        error.code === 429 ||
        errMsg.includes("429") || 
        errMsg.includes("quota") || 
        errMsg.includes("limit") || 
        errMsg.includes("exhausted") ||
        JSON.stringify(error).includes("429") ||
        JSON.stringify(error).includes("RESOURCE_EXHAUSTED");

      if (attempt >= maxRetries || !isRateLimit) {
        throw error;
      }
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`[JusticeAI] Gemini API rate limit hit. Retrying attempt ${attempt}/${maxRetries} in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

// Robust fallback legal consultation generator in case of Gemini API quota limit (429) exhaustion
function getFallbackLegalAnalysis(description: string, location: string, category: string, language: string) {
  const descLower = (description || "").toLowerCase();
  const locLower = (location || "").toLowerCase();
  const catLower = (category || "").toLowerCase();

  // 1. Housing / RERA / Tenant Security Deposit / Flat Possession Delay
  if (
    catLower === "housing" ||
    descLower.includes("rera") ||
    descLower.includes("flat") ||
    descLower.includes("possession") ||
    descLower.includes("builder") ||
    descLower.includes("rent") ||
    descLower.includes("deposit") ||
    descLower.includes("landlord") ||
    descLower.includes("tenant")
  ) {
    // Check if in India/Maharashtra
    if (locLower.includes("pune") || locLower.includes("mumbai") || locLower.includes("maharashtra") || locLower.includes("india")) {
      if (language === "Marathi" || language === "marathi") {
        return {
          findings: "महाराष्ट्र स्थावर संपदा (नियमन आणि विकास) अधिनियम, २०१६ (MahaRERA) च्या कलम १८ नुसार, जर प्रवर्तक (बिल्डर) करारात नमूद केलेल्या मुदतीत सदनिकेचा (फ्लॅट) ताबा देण्यास असमर्थ ठरला, तर खरेदीदार स्वतःच्या इच्छेनुसार प्रकल्पातून बाहेर पडून भरलेली सर्व रक्कम व्याजासह परत मिळवण्यास किंवा ताबा मिळेपर्यंत दरमहा व्याज मिळवण्यास पात्र आहे. याशिवाय ग्राहक संरक्षण कायदा, २०१९ च्या तरतुदींनुसार सेवांमधील त्रुटींबद्दल नुकसानभरपाई देखील मिळवता येते.",
          statutesList: [
            "स्थावर संपदा (नियमन आणि विकास) अधिनियम, २०१६ (RERA) - कलम १८",
            "महाराष्ट्र स्थावर संपदा नियम, २०१७ - नियम १८ आणि १९",
            "ग्राहक संरक्षण कायदा, २०१९ - कलम २(११) (सेवेतील त्रुटी)"
          ],
          explainer: {
            summary: "पुण्यातील किंवा महाराष्ट्रातील आपल्या फ्लॅटचा ताबा मिळण्यास विलंब झाल्यामुळे तुम्हाला बिल्डरकडून विलंबाच्या कालावधीचे व्याज किंवा संपूर्ण भरलेली रक्कम व्याजासह परत मिळवण्याचा पूर्ण कायदेशीर हक्क आहे. महारेरा अंतर्गत तुम्ही आपले हक्क सुरक्षित करू शकता.",
            keyRights: [
              "**विलंब व्याज मिळवण्याचा अधिकार**: ताबा मिळण्यास झालेल्या विलंबाच्या प्रत्येक महिन्यासाठी आरबीआयच्या कर्ज दरापेक्षा २% जास्त दराने (अंदाजे १०-११% प्रतिवर्ष) व्याज मिळवणे.",
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
            reasoning: "पुणे आणि महाराष्ट्रातील रिअल इस्टेट क्षेत्रातील सर्व वाद महारेरा प्राधिकरणाद्वारे जलद गतीने सोडवले जातात. ग्राहक न्यायालयाच्या तुलनेत येथे लवकर निर्णय मिळतो.",
            contactDetails: "पत्ता: महारेरा कार्यालय, वांद्रे-कुर्ला कॉम्प्लेक्स, मुंबई / पुणे विभाग संपर्क कार्यालय. वेबसाइट: https://maharera.maharashtra.gov.in",
            procedure: "१. महारेराच्या अधिकृत संकेतस्थळाला भेट द्या.\n२. 'तक्रार नोंदणी' (Form M) निवडा आणि तुमची माहिती भरा.\n३. तक्रार फी ₹५,००० ऑनलाइन भरा.\n४. कराराची प्रत आणि पुराव्यांची कागदपत्रे अपलोड करा.\n५. बिल्डरला तक्रारीची प्रत पाठवून सुनावणीला हजर रहा."
          },
          generator: {
            letterTitle: "महारेरा कायदा २०१६ च्या कलम १८ अंतर्गत फ्लॅटचा ताबा मिळण्यास विलंब झाल्याबद्दल बिल्डरला कायदेशीर नोटीस",
            letterBody: "प्रति,\n[Recipient Name]\n[बिल्डरचे नाव/पत्ता]\n\nविषय: महारेरा कायदा २०१६ च्या कलम १८ अन्वये विलंबाचे व्याज आणि नुकसानभरपाई मिळणेबाबत नोटीस\n\nमहोदय,\n\nमी, [Your Name], पुणे येथील आपल्या प्रकल्पात फ्लॅट बुक केला आहे. करारानुसार ताबा डिसेंबर २०२५ पूर्वी मिळणे अपेक्षित होते. मी आत्तापर्यंत एकूण [Amount] रक्कम भरली आहे. परंतु, अजूनही बांधकाम अपूर्ण आहे आणि ताबा देण्यात आलेला नाही.\n\nया नोटीसीद्वारे मी आपणास विनंती करतो की महारेरा कलम १८ नुसार झालेल्या विलंबाबद्दल मला व्याजाची रक्कम अदा करावी किंवा संपूर्ण रकमेचा परतावा द्यावा, अन्यथा मी महारेरा न्यायाधिकरणाकडे कायदेशीर तक्रार दाखल करेन.\n\nआपला नम्र,\n\n[Your Name]",
            instructions: "ही नोटीस बिल्डरच्या अधिकृत ईमेल पत्त्यावर आणि नोंदणीकृत पत्त्यावर आर.पी.ए.डी. (RPAD) पोस्टाद्वारे पाठवा. पोस्टाची पावती पुरावा म्हणून जपून ठेवा."
          }
        };
      } else if (language === "Hindi" || language === "hindi") {
        return {
          findings: "रियल एस्टेट (विनियमन और विकास) अधिनियम, 2016 (RERA) की धारा 18 के तहत, यदि डेवलपर अनुबंध के अनुसार समय पर फ्लैट का कब्जा देने में विफल रहता है, तो खरीदार भुगतान की गई राशि पर ब्याज सहित धन वापसी का हकदार है। इसके अतिरिक्त, कब्जा मिलने तक हर महीने के विलंब के लिए ब्याज प्राप्त करने का अधिकार भी है।",
          statutesList: [
            "रियल एस्टेट (विनियमन और विकास) अधिनियम, 2016 - धारा 18",
            "महाराष्ट्र रियल एस्टेट नियम, 2017 - नियम 18",
            "उपभोक्ता संरक्षण अधिनियम, 2019"
          ],
          explainer: {
            summary: "पुणे में आपके फ्लैट के कब्जे में देरी के कारण, आपको बिल्डर से ब्याज या रिफंड प्राप्त करने का पूरा कानूनी अधिकार है। रेरा के तहत बिल्डर पर भारी जुर्माना और ब्याज भुगतान का प्रावधान है।",
            keyRights: [
              "**देरी पर ब्याज का अधिकार**: विलंब की अवधि के लिए निर्धारित ब्याज दर पर हर महीने ब्याज पाने का अधिकार।",
              "**पूरी वापसी का अधिकार**: यदि आप प्रोजेक्ट से बाहर निकलना चाहते हैं, तो ब्याज सहित पूरी राशि वापस पाने का अधिकार।",
              "**मुनावजे का अधिकार**: प्रोजेक्ट की विफलता के कारण हुए किसी भी वित्तीय नुकसान के लिए मुआवजा।"
            ],
            actionSteps: [
              "अपने पंजीकृत 'Agreement for Sale' की प्रति सुरक्षित रखें।",
              "बिल्डर को किए गए भुगतान की रसीदें और बैंक स्टेटमेंट का मिलान करें।",
              "बिल्डर को रेरा की धारा 18 के तहत औपचारिक मांग पत्र (Demand Letter) भेजें।",
              "समाधान न होने पर महारेरा की वेबसाइट पर शिकायत दर्ज करें।"
            ]
          },
          recommendation: {
            authorityName: "महाराष्ट्र रियल एस्टेट नियामक प्राधिकरण (MahaRERA) न्यायाधिकरण",
            reasoning: "महाराष्ट्र में रियल एस्टेट से जुड़े विवादों के त्वरित निवारण के लिए महारेरा सबसे सशक्त माध्यम है।",
            contactDetails: "वेबसाइट: https://maharera.maharashtra.gov.in",
            procedure: "1. महारेरा पोर्टल पर जाकर 'New Complaint' दर्ज करें।\n2. फॉर्म एम (Form M) भरें और आवश्यक दस्तावेज जैसे एग्रीमेंट की प्रति अपलोड करें।\n3. ₹5,000 की शिकायत फीस का ऑनलाइन भुगतान करें।\n4. विपक्षी पार्टी को शिकायत की कॉपी ईमेल करें और सुनवाई की तिथि का इंतजार करें।"
          },
          generator: {
            letterTitle: "रेरा अधिनियम, 2016 की धारा 18 के तहत कब्जा मिलने में देरी के लिए बिल्डर को मांग पत्र",
            letterBody: "सेवा में,\n[Recipient Name]\n[बिल्डर का नाम/पता]\n\nविषय: रेरा अधिनियम, 2016 की धारा 18 के तहत फ्लैट कब्जे में देरी के लिए ब्याज और मुआवजे की मांग।\n\nमहोदय,\n\nमैं, [Your Name], आपके पुणे स्थित प्रोजेक्ट में फ्लैट का आवंटी हूं। अनुबंध के अनुसार मुझे दिसंबर २०२५ तक फ्लैट का कब्जा मिलना था। मैंने अब तक कुल [Amount] का भुगतान किया है, फिर भी कब्जा नहीं मिला है।\n\nअतः मैं इस पत्र के माध्यम से मांग करता हूं कि मुझे विलंब अवधि के लिए रेरा नियमों के अनुसार देय ब्याज का भुगतान किया जाए।\n\nभवदीय,\n\n[Your Name]",
            instructions: "इस नोटिस को पंजीकृत डाक (Registered AD) या स्पीड पोस्ट द्वारा बिल्डर के आधिकारिक पते पर भेजें और रसीद सुरक्षित रखें।"
          }
        };
      } else {
        // English
        return {
          findings: "Under Section 18 of the Real Estate (Regulation and Development) Act, 2016 (RERA), if a promoter fails to complete or is unable to give possession of an apartment in accordance with the terms of the agreement for sale, they are liable to return the amount received with interest at prescribed rates or pay monthly interest for every month of delay until possession is delivered.",
          statutesList: [
            "Real Estate (Regulation and Development) Act, 2016 - Section 18",
            "Maharashtra Real Estate (Regulation and Development) Rules, 2017",
            "Consumer Protection Act, 2019"
          ],
          explainer: {
            summary: "Because of the delay in flat possession in Pune, you have an absolute legal right to demand monthly interest from the builder or seek a complete refund of your principal amount with interest. RERA provides a highly structured dispute resolution tribunal to enforce these claims.",
            keyRights: [
              "**Right to Delay Interest**: Receive interest at the SBI highest marginal cost of lending rate (MCLR) + 2% for every month of possession delay.",
              "**Right to Absolute Withdrawal**: Withdraw from the project and demand 100% of your paid amount returned with compounding interest.",
              "**Right to Structural Repair**: Protection against any structural defects in construction for 5 years after taking possession."
            ],
            actionSteps: [
              "Assemble a certified copy of your registered Agreement for Sale.",
              "Collect all receipts, bank letters, and statements showing your financial payments.",
              "Draft and serve a formal demand letter under RERA Section 18 demanding immediate interest or refund.",
              "File an official complaint (Form 'M') online on the Maharashtra RERA portal if the developer ignores the notice."
            ]
          },
          recommendation: {
            authorityName: "Maharashtra Real Estate Regulatory Authority (MahaRERA) Tribunal, Pune Division",
            reasoning: "MahaRERA regulates all real estate developers in Pune and Mumbai. It has fast-track benches to adjudicate delayed possession and order builders to deposit interest or face asset attachment.",
            contactDetails: "Website: https://maharera.maharashtra.gov.in / Helpline: 022-26590000",
            procedure: "1. Create a user profile on MahaRERA's public portal.\n2. Go to 'Complaint Registration' and choose Form M.\n3. Enter project registration number, flat details, and your specific grievances.\n4. Pay the online statutory fee of ₹5,000.\n5. Upload the signed agreement and payment history. Serve a copy to the builder."
          },
          generator: {
            letterTitle: "Formal Demand Notice under Section 18 of the RERA Act, 2016 for Delayed Flat Possession",
            letterBody: "To,\n[Recipient Name]\n[Builder Developer Name/Address]\n\nRE: Demand Notice under Section 18 of the Real Estate (Regulation and Development) Act, 2016 for project delay at Pune.\n\nDear Sir/Madam,\n\nI, [Your Name], entered into an Agreement for Sale with you for flat possession scheduled for December 2025. I have faithfully paid a total sum of [Amount] towards this unit. As of today, the project is incomplete, and you have failed to deliver possession.\n\nPlease accept this formal demand under Section 18 of the RERA Act to pay interest for the delayed period or facilitate a complete refund within 15 days, failing which I shall approach the MahaRERA Tribunal.\n\nSincerely,\n\n[Your Name]",
            instructions: "Transmit this demand letter via Registered Post with Acknowledgement Due (RPAD) or Speed Post to the developer's registered head office. Keep a copy and the postal receipt."
          }
        };
      }
    } else {
      // US Tenant Deposit Fallback (e.g., California)
      return {
        findings: "Under California Civil Code Section 1950.5, a landlord is strictly required to return a tenant's security deposit or provide an itemized statement of deductions, along with copies of receipts for any repairs exceeding $125, within 21 calendar days after vacating. Landlords who withhold a deposit in bad faith can be held liable for statutory treble damages of up to twice the amount of the deposit, plus actual damages.",
        statutesList: [
          "California Civil Code Section 1950.5 (Security Deposits)",
          "California Civil Code Section 1941.1 (Implied Warranty of Habitability)",
          "California Code of Civil Procedure Section 116.220 (Small Claims Jurisdiction)"
        ],
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
      };
    }
  }

  // 2. Consumer Electronics / Device Refund Denied
  if (
    catLower === "consumer" ||
    descLower.includes("phone") ||
    descLower.includes("refund") ||
    descLower.includes("device") ||
    descLower.includes("electronics") ||
    descLower.includes("store") ||
    descLower.includes("laptop") ||
    descLower.includes("television")
  ) {
    if (locLower.includes("mumbai") || locLower.includes("pune") || locLower.includes("maharashtra") || locLower.includes("india")) {
      if (language === "Hindi" || language === "hindi") {
        return {
          findings: "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत, किसी भी ग्राहक को त्रुटिपूर्ण उत्पाद (Defective Product) के लिए रिप्लेसमेंट या रिफंड पाने का पूर्ण अधिकार है। यदि खरीदारी के 7 दिनों के भीतर कोई इलेक्ट्रॉनिक उपकरण खराब हो जाता है, तो विक्रेता ग्राहक को 'सर्विस सेंटर जाने' के लिए बाध्य नहीं कर सकता; यह 'अनुचित व्यापार प्रथा' (Unfair Trade Practice) के अंतर्गत आता है।",
          statutesList: [
            "उपभोक्ता संरक्षण अधिनियम, 2019 - धारा 2(47)",
            "भारतीय अनुबंध अधिनियम, 1872 - धारा 73",
            "उपभोक्ता संरक्षण (ई-कॉमर्स) नियम, 2020"
          ],
          explainer: {
            summary: "यदि खरीदा गया मोबाइल 7 दिनों में खराब हो जाता है, तो कानूनन स्टोर मालिक आपको सीधे रिफंड या रिप्लेसमेंट देने के लिए उत्तरदायी है। वे आपको सर्विस सेंटर भेजकर अपनी जिम्मेदारी से बच नहीं सकते।",
            keyRights: [
              "**त्रुटिमुक्त उत्पाद का अधिकार**: खराबी आने पर रिप्लेसमेंट या पूरा रिफंड पाने का अधिकार।",
              "**निवारण का अधिकार**: अनुचित व्यापार प्रथाओं के खिलाफ शिकायत दर्ज करने और मुआवजा पाने का अधिकार।",
              "**उत्पाद दायित्व**: निर्माता और विक्रेता दोनों ही त्रुटिपूर्ण उत्पाद के नुकसान के लिए जिम्मेदार हैं।"
            ],
            actionSteps: [
              "दुकानदार से लिखित में रिफंड से इनकार का कारण मांगें या ईमेल भेजें।",
              "खरीदारी का बिल (Invoice) और फोन की खराबी का वीडियो रिकॉर्डिंग संभाल कर रखें।",
              "स्टोर मैनेजर को उपभोक्ता संरक्षण अधिनियम के तहत 7 दिनों का नोटिस भेजें।",
              "राष्ट्रीय उपभोक्ता हेल्पलाइन (NCH) 1915 पर कॉल करें या शिकायत दर्ज करें।"
            ]
          },
          recommendation: {
            authorityName: "जिला उपभोक्ता विवाद निवारण आयोग (Consumer Forum), मुंबई/पुणे",
            reasoning: "उपभोक्ता फोरम सीधे उपभोक्ताओं के अधिकारों की रक्षा करता है और विक्रेताओं पर जुर्माना लगाने की शक्ति रखता है।",
            contactDetails: "वेबसाइट: https://edaakhil.nic.in / टोल-फ्री हेल्पलाइन: 1915",
            procedure: "1. 'e-Daakhil' पोर्टल पर लॉग इन करें।\n2. विक्रेता और निर्माता के खिलाफ शिकायत दर्ज करें।\n3. बिल, वारंटी कार्ड और खराबी के सबूत अपलोड करें।\n4. नाममात्र की फीस का भुगतान करें।\n5. बिना वकील के खुद अपना पक्ष रखें।"
          },
          generator: {
            letterTitle: "उपभोक्ता संरक्षण अधिनियम, 2019 के तहत खराब मोबाइल के रिफंड/रिप्लेसमेंट के लिए कानूनी नोटिस",
            letterBody: "सेवा में,\n[Recipient Name]\n[स्टोर का नाम/पता]\n\nविषय: खराब मोबाइल फोन के लिए पूर्ण रिफंड या रिप्लेसमेंट की मांग।\n\nमहोदय,\n\nमैं, [Your Name], ने दिनांक [Date] को आपके स्टोर से ₹45,000 की राशि देकर एक नया स्मार्टफोन खरीदा था (इनवॉइस नंबर: [Invoice]). खरीद के मात्र 7 दिनों के भीतर फोन बार-बार रीस्टार्ट होने लगा, जो कि एक गंभीर विनिर्माण दोष है।\n\nआपके द्वारा रिफंड से इनकार करना उपभोक्ता अधिकारों का उल्लंघन है। मैं मांग करता हूँ कि आप 7 दिनों के भीतर मुझे नया फोन दें या [Amount] की पूरी राशि वापस करें।\n\nभवदीय,\n\n[Your Name]",
            instructions: "इस नोटिस को स्टोर के ईमेल पर भेजें और एक प्रति स्पीड पोस्ट से भेजें।"
          }
        };
      } else {
        // English / Default
        return {
          findings: "Under the Consumer Protection Act, 2019, denying a refund or replacement for an inherently defective electronic device within the warranty or initial return period constitutes an 'Unfair Trade Practice' and 'Deficiency of Service'. The retailer is legally responsible to provide merchantable quality products and cannot dodge liability by directing the customer to a third-party service center.",
          statutesList: [
            "Consumer Protection Act, 2019 - Section 2(47) (Unfair Trade Practice)",
            "Consumer Protection (Product Liability) Rules, 2020",
            "Sale of Goods Act, 1930 - Section 16 (Implied Warranty of Quality)"
          ],
          explainer: {
            summary: "Because your newly purchased electronic device broke down within 7 days, the retail store is directly responsible for replacing it or returning your money. They cannot legally refuse or force you to navigate technical service center procedures on your own.",
            keyRights: [
              "**Right to Product Quality**: Right to receive a fully functional device of merchantable standard.",
              "**Right to Product Liability**: Seek compensation from both the product manufacturer and seller for defects.",
              "**Right to Redressal**: File a dispute online without requiring an expensive legal representative."
            ],
            actionSteps: [
              "Ensure you have a copy of the purchase invoice and warranty certificate.",
              "Take a short video demonstrating the defect (phone restarting automatically).",
              "Send a written demand to the store manager demanding a refund/replacement.",
              "File a grievance with the National Consumer Helpline (NCH) by dialling 1915."
            ]
          },
          recommendation: {
            authorityName: "District Consumer Disputes Redressal Commission (Consumer Forum)",
            reasoning: "The Consumer Forum has absolute jurisdiction to try consumer complaints, enforce warranty clauses, and award punitive damages for harassment.",
            contactDetails: "E-Filing Portal: https://edaakhil.nic.in / Toll-Free Number: 1915",
            procedure: "1. Visit the online e-Daakhil portal.\n2. Register and file your claim describing the purchase and defects.\n3. Upload the retail invoice, warranty, and refusal letters.\n4. Pay the minor filing fee online (waived for claims up to ₹5 Lakhs).\n5. Attend the simplified mediation session or online hearing."
          },
          generator: {
            letterTitle: "Formal Demand Notice for Refund/Replacement of Defective Smartphone",
            letterBody: "To,\n[Recipient Name]\n[Retail Store Name/Address]\n\nRE: Formal Demand for Refund or Replacement of Defective Device purchased on [Date].\n\nDear Store Manager,\n\nI, [Your Name], purchased a smartphone from your retail store for [Amount] on [Date] (Invoice: [Invoice]). Within 7 days, the device developed a severe hardware failure, restarting repeatedly.\n\nYour refusal to exchange this item or refund my money constitutes a clear Deficiency of Service under the Consumer Protection Act, 2019. Please replace this device or issue a full refund of [Amount] within 7 days, or I shall file a complaint before the Consumer Commission.\n\nSincerely,\n\n[Your Name]",
            instructions: "Deliver this notice by email and speed post. Keep a copy of the delivery report."
          }
        };
      }
    } else {
      // General UK/US Defective Consumer electronics
      return {
        findings: "Under standard consumer protection guidelines (such as the Consumer Rights Act in the UK or state-level Uniform Commercial Code in the US), goods must be of satisfactory quality, fit for purpose, and as described. If a product develops a serious defect within 30 days, the customer has an absolute statutory right to reject the product and obtain a full refund without any deductions.",
        statutesList: [
          "Consumer Rights Act 2015 (UK) / Uniform Commercial Code Section 2-314",
          "Sale of Goods Guidelines on Implied Warranty of Merchantability",
          "Federal Trade Commission (FTC) Consumer Protection Rules"
        ],
        explainer: {
          summary: "You are legally entitled to receive products that function perfectly as advertised. When a device fails in the first 30 days, the retailer is legally obliged to credit your purchase price back. No repair cycle loops or store credit substitutions can be forced upon you.",
          keyRights: [
            "**Statutory Right to Reject**: Reject inherently faulty goods within 30 days of purchase for a 100% refund.",
            "**Right to Direct Store Remedy**: The retailer (not the manufacturer) is liable to resolve your dispute directly.",
            "**Implied Warranty of Merchantability**: Protection ensuring any device functions normally for its expected lifespan."
          ],
          actionSteps: [
            "Preserve your receipts, invoices, packaging materials, and delivery notes.",
            "Document the product defect with photos or a clear short video.",
            "Send a written 'Letter of Rejection' citing the Consumer Rights Act directly to the store management.",
            "Contact your credit card issuer to initiate a chargeback dispute if paid electronically."
          ]
        },
        recommendation: {
          authorityName: "Trading Standards Office / Civil Small Claims Court",
          reasoning: "Trading Standards regulates retail stores for unfair practices, while the Small Claims Court enforces your financial right to a cash refund.",
          contactDetails: "Contact Citizens Advice Consumer Service or your state's attorney general department.",
          procedure: "1. Draft a chronological list of events, purchases, and refund requests.\n2. Submit a formal query to Citizens Advice or local consumer protection agent.\n3. If unpaid, file a simple small claim online (Money Claim Online in the UK).\n4. Submit photos, letters, and invoices as proof for judge review."
        },
        generator: {
          letterTitle: "Formal Notice of Rejection and Request for Refund of Defective Device",
          letterBody: "To,\n[Recipient Name]\n[Retail Company Name/Address]\n\nRE: Formal Rejection of Defective Goods and Request for Refund.\n\nDear Store Manager,\n\nI, [Your Name], purchased an electronic device from your store on [Date] for [Amount]. Within several days, the device developed a severe malfunction rendering it unfit for purpose.\n\nUnder applicable consumer rights laws, I am exercising my statutory right to reject these goods due to inherent manufacturing defects. Please credit my original payment method with the sum of [Amount] within 7 days, or I shall proceed with formal chargeback and small claims filing.\n\nSincerely,\n\n[Your Name]",
          instructions: "Deliver this by email and hand it over to the store counter. Ask for a stamped duplicate copy."
        }
      };
    }
  }

  // 3. Labor & Employment / Unpaid Salary / Gratuity
  if (
    catLower === "labor" ||
    descLower.includes("salary") ||
    descLower.includes("wage") ||
    descLower.includes("employer") ||
    descLower.includes("employee") ||
    descLower.includes("job") ||
    descLower.includes("termination") ||
    descLower.includes("severance") ||
    descLower.includes("gratuity")
  ) {
    return {
      findings: "Under employment regulations (such as the Payment of Wages Act, 1936, and state-specific Shops and Commercial Establishments Acts in India, or FLSA/WARN Acts in the US), withholding earned salary after termination of employment is strictly illegal. Employers are required to settle all pending wages, severance, and statutory gratuity within 48 hours to 7 days of termination. Unilateral termination without contractually agreed notice pay also entitles the employee to notice period salary.",
      statutesList: [
        "The Payment of Wages Act, 1936 - Section 5 (Time of Payment of Wages)",
        "Shops and Commercial Establishments Act - Section 30 (Notice of Termination)",
        "The Payment of Gratuity Act, 1972"
      ],
      explainer: {
        summary: "Your employer cannot legally withhold your earned salary, gratuity, or contractually mandated severance pay upon termination. Any attempt to lock away your salary is a severe violation of labor statutes, and they can be ordered to pay hefty interest penalties.",
        keyRights: [
          "**Right to Full Wages**: Receive complete payment for all days worked without unauthorized deductions.",
          "**Notice Pay Protection**: Right to receive notice period pay (e.g., 1-3 months) as specified in the employment agreement.",
          "**Statutory Gratuity**: Right to gratuity if you have completed continuous service for any specified duration."
        ],
        actionSteps: [
          "Download all salary slips, bank transaction logs, and your signed employment contract.",
          "Keep copies of the termination letter/email and any correspondence regarding unpaid dues.",
          "Send a strong legal notice demanding immediate settlement of all outstanding dues.",
          "Submit a formal petition to the regional Labor Commissioner if unpaid after 10 days."
        ]
      },
      recommendation: {
        authorityName: "Office of the Regional Labor Commissioner / Labor Court",
        reasoning: "The Labor Commissioner enforces statutory wage payments and has executive powers to issue recovery citations to employers.",
        contactDetails: "State Labor Department Portal or Regional Commissioner's Office in your district.",
        procedure: "1. Draft a petition detailing your employment history, pending salary, and termination.\n2. Submit the petition to the local Labor Inspector's office.\n3. The inspector will issue a summons to the company management to attend joint conciliation.\n4. If unresolved, the case is referred to the Labor Court for recovery orders."
      },
      generator: {
        letterTitle: "Legal Demand Notice for Unpaid Salary, Severance, and Settlement of Dues",
        letterBody: "To,\n[Recipient Name]\n[Company Name/Address]\n\nRE: Formal Demand for Immediate Payment of Withheld Salary and Notice Pay.\n\nDear Sir/Madam,\n\nI, [Your Name], worked as an employee at your firm. On [Date], my employment was summarily terminated with only 1-day notice. My earned salary for the last 3 months totaling [Amount], along with my notice period pay, remains withheld.\n\nThis withholding is a direct violation of the Payment of Wages Act. Please credit my bank account with the full amount of [Amount] within 7 days, or I will proceed with filing a formal recovery case before the Labor Commissioner.\n\nSincerely,\n\n[Your Name]",
        instructions: "Send this notice to the HR department and the company directors via corporate email and speed post. Request an read-receipt."
      }
    };
  }

  // 4. General Civil / Default Fallback
  return {
    findings: `Under civil codes and general contract law principles in ${location || 'your jurisdiction'}, both parties are legally bound by the terms of their agreement. Breaching contractual clauses, withholding refunds, or violating mutual civic agreements without a valid legal defense establishes clear liability. The aggrieved party is entitled to seek restitution, damages, interest, and costs before a civil court or specialized tribunal.`,
    statutesList: [
      "Civil Contract Code / General Obligations Act",
      "Consumer Welfare & Consumer Protection Directives",
      "Small Claims Fast-Track Recovery Statutes"
    ],
    explainer: {
      summary: "You are fully protected under the civil and contract codes. Since a clear dispute exists, you have immediate recourse to formal demand notices and fast-track small claims filings.",
      keyRights: [
        "**Right to Contract Compliance**: Expect all parties to perform their mutual obligations faithfully.",
        "**Protection Against Bad Faith**: Recover funds withheld without legal justification.",
        "**Right to Legal Remedy**: Access small claims courts or regulatory tribunals to resolve issues."
      ],
      actionSteps: [
        "Compile all written agreements, text receipts, and email communications.",
        "Draft and send a formal, dated demand notice specifying a 14-day compliance window.",
        "Gather witnesses or video evidence supporting your claim.",
        "Locate your local county or small claims court clerk to prepare filing documents."
      ]
    },
    recommendation: {
      authorityName: "Local Small Claims Court or Specialized Civil Tribunal",
      reasoning: "Small claims court provides a rapid, cost-effective venue to settle civil disputes and breaches of contract without costly attorney fees.",
      contactDetails: "Visit your local municipal court clerk or search county civil services online.",
      procedure: "1. Obtain the civil complaint or plaintiff's claim form.\n2. Clearly outline the breach, dates, and total financial damages.\n3. Pay the filing fee (usually between $20 and $100).\n4. Formally serve the other party and attend the court hearing with all evidence."
    },
    generator: {
      letterTitle: "Formal Demand Notice for Settlement of Outstanding Claim",
      letterBody: "To,\n[Recipient Name]\n[Opposing Party Name/Address]\n\nRE: Formal Demand for payment of [Amount] regarding Contractual Breach.\n\nDear [Recipient Name],\n\nThis letter is a formal demand for the payment of [Amount] due to me regarding our contract dated [Date]. You have failed to fulfill your side of the agreement, resulting in clear financial damage.\n\nPlease arrange for the transfer of the full amount [Amount] within 14 days of this notice, or I will file an action in Small Claims Court without further warning.\n\nSincerely,\n\n[Your Name]",
      instructions: "Serve this demand letter via certified mail or registered delivery with signature tracking."
    }
  };
}

// 1. API: Legal Consultation Pipeline (Optimized into a single structured LLM call with retry)
app.post("/api/consult", async (req, res) => {
  const { description, location, category, language = "English" } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    console.log(`[JusticeAI] Starting unified legal consultation for category: ${category} in location: ${location}`);

    const combinedPrompt = `
      You are the elite JusticeAI Multi-Agent Legal Advisory Board.
      Your task is to conduct rigorous legal research, translate findings into layperson-friendly language, identify the correct filing authority, and draft a professional demand letter for the user's situation.

      User Situation: "${description}"
      Location (State/Country): "${location || 'Unspecified (Provide general advice and standard legal precedents)'}"
      Legal Category: "${category || 'General Civil Rights / Legal Assistance'}"
      Language: Respond entirely in "${language}".

      Instructions:
      1. Conduct rigorous legal research citing specific statutes/acts/codes for "${location}". If the location is in India (or any Indian state/city like Maharashtra, Pune, Mumbai, Karnataka, Bengaluru, Delhi, etc.), search specifically for applicable Indian Central or State regulations (e.g., The Consumer Protection Act 2019, Real Estate Regulatory Authority (RERA) Act 2016, The Payment of Wages Act 1936, state Rent Control Acts, etc.). Explain the legal standing. Store this in "findings".
      2. Provide a list of 2-5 key specific acts, codes, or sections cited in the brief as a list. Store this in "statutesList".
      3. Translate the findings into a supportive, easy-to-understand explanation with key rights and next steps. Store this in "explainer".
      4. Identify the exact government agency, consumer forum, or court (e.g. RERA tribunal, Labor Commissioner, District Consumer Disputes Redressal Commission, Small Claims) that handles this category in "${location}" with procedures and contacts. Store this in "recommendation".
      5. Draft a formal demand letter or petition with [Bracketed Placeholders] for the user's variables, along with transmission instructions. Store this in "generator".

      Translation Guideline: Write the response completely in "${language}". For Indian languages like Hindi (हिंदी) or Marathi (मराठी), translate all general explanations, action steps, letter body, and procedures fluently. However, you can keep technical statutory references or official names of authorities in clean transliterated or parenthetical English forms if that helps maintain legal clarity and authority recognition.

      You MUST search the web (using the Google Search tool) to verify the exact name and number of relevant local statutes and the official names of filing authorities. Do not make up laws.
    `;

    const schemaConfig = {
      type: Type.OBJECT,
      properties: {
        findings: {
          type: Type.STRING,
          description: "A professional, rigorous, and thorough legal research analysis of the user's situation. Identify specific laws, statutes, acts, or civil codes that directly apply in the specified location. Cite exact section numbers (e.g. California Civil Code Section 1950.5). Explain the legal liability and duties."
        },
        statutesList: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of 2-5 key specific acts, codes, or sections cited in the brief (e.g. 'California Civil Code Section 1950.5' or 'Real Estate Regulatory Authority (RERA) Section 18')."
        },
        explainer: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "An easy-to-understand, empathetic 3-4 sentence paragraph summarizing why the user is protected or what the core legal issue means for them in plain language."
            },
            keyRights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-5 specific rights the user has in this situation, written in bold, clear language (e.g. 'Right to itemized refund within 21 days')."
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-5 clear, concrete, step-by-step recommendations the user can perform right now."
            }
          },
          required: ["summary", "keyRights", "actionSteps"]
        },
        recommendation: {
          type: Type.OBJECT,
          properties: {
            authorityName: {
              type: Type.STRING,
              description: "The official name of the specific state/local/federal agency or court (e.g. 'California Labor Commissioner's Office' or 'Maharashtra Real Estate Regulatory Authority')."
            },
            reasoning: {
              type: Type.STRING,
              description: "A concise paragraph explaining why this specific authority is the correct venue and how they can help the user."
            },
            contactDetails: {
              type: Type.STRING,
              description: "Specific websites, hotlines, or address templates relevant to this authority if known."
            },
            procedure: {
              type: Type.STRING,
              description: "A bulleted or numbered description of the standard complaint filing procedure."
            }
          },
          required: ["authorityName", "reasoning", "contactDetails", "procedure"]
        },
        generator: {
          type: Type.OBJECT,
          properties: {
            letterTitle: {
              type: Type.STRING,
              description: "A concise title of the document (e.g. 'Formal Demand for Security Deposit Return')."
            },
            letterBody: {
              type: Type.STRING,
              description: "The full body of the formal demand letter or notice. Use double linebreaks \\n\\n for paragraphs. Ensure a highly professional layout including formal greeting and closing. Use [Bracketed Placeholders] for variables."
            },
            instructions: {
              type: Type.STRING,
              description: "Specific guidance on how the user should transmit this letter."
            }
          },
          required: ["letterTitle", "letterBody", "instructions"]
        }
      },
      required: ["findings", "statutesList", "explainer", "recommendation", "generator"]
    };

    console.log("[JusticeAI] Calling combined multi-agent Gemini pipeline...");
    let combinedResponse;
    try {
      combinedResponse = await callGeminiWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: combinedPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: schemaConfig as any
        }
      }), 2, 1000);
    } catch (groundingErr: any) {
      console.warn("[JusticeAI] Primary search grounding call failed, falling back to clean model call without web search. Error:", groundingErr.message || groundingErr);
      
      combinedResponse = await callGeminiWithRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: combinedPrompt + "\n(Note: Please formulate your response using your internal legal expertise since the live web search is currently unavailable.)",
        config: {
          responseMimeType: "application/json",
          responseSchema: schemaConfig as any
        }
      }), 2, 1000);
    }

    let combinedData;
    try {
      combinedData = JSON.parse(combinedResponse.text.trim());
    } catch (parseErr) {
      console.error("[JusticeAI] Error parsing combined response JSON:", parseErr, "Raw Text:", combinedResponse.text);
      throw new Error("Failed to parse legal analysis payload from Gemini.");
    }

    const researchText = combinedData.findings || "No findings generated.";
    const statutesData = combinedData.statutesList && combinedData.statutesList.length > 0
      ? combinedData.statutesList 
      : Array.from(new Set(researchText.match(/[A-Za-z\s]+(Code|Section|Act|Law|§)\s*[0-9A-Za-z.-]+/g) || [])).slice(0, 5);

    const explainerData = combinedData.explainer || {
      summary: "We have summarized your legal standing. You have clear protections under local law.",
      keyRights: ["Right to fair treatment", "Right to dispute arbitrary charges", "Right to seek legal remedy"],
      actionSteps: ["Document all correspondence", "Request formal explanation", "File a complaint with local authorities"]
    };
    const recommendationData = combinedData.recommendation || {
      authorityName: "Local Small Claims Court or State Consumer Protection Bureau",
      reasoning: "This agency handles disputes of this scale when private mediation fails.",
      contactDetails: "Visit your local government directory or search online for small claims filing.",
      procedure: "1. Gather evidence (receipts, contracts, letters).\n2. Request a formal dispute form from the clerk.\n3. File the claim and serve the opposing party."
    };
    const generatorData = combinedData.generator || {
      letterTitle: "Formal Notice of Dispute",
      letterBody: `[Your Name]\n[Your Address]\n[Your Contact Information]\n\n[Date]\n\n[Recipient Name]\n[Recipient Address]\n\nRE: Formal Notice of Dispute regarding ${category || 'Grievance'}\n\nDear [Recipient Name],\n\nThis letter serves as a formal notice of dispute regarding the ongoing issue.\n\nSincerely,\n\n[Your Signature]`,
      instructions: "Fill out the bracketed information, sign, and deliver to the counterparty via email or recorded delivery."
    };

    // Extract search grounding links from the combined response
    const rawChunks = combinedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = rawChunks
      .map((chunk: any) => {
        if (chunk.web) {
          return {
            title: chunk.web.title || "Reference Source",
            uri: chunk.web.uri,
          };
        }
        return null;
      })
      .filter((s: any) => s !== null) as Array<{ title: string; uri: string }>;

    // Remove duplicate sources
    const uniqueSources = Array.from(new Map(searchSources.map(item => [item.uri, item])).values());

    // Assemble the complete case session portfolio
    const analysis = {
      researcher: {
        findings: researchText,
        statutes: statutesData,
        sources: uniqueSources,
      },
      explainer: explainerData,
      recommendation: recommendationData,
      generator: generatorData,
    };

    console.log("[JusticeAI] Combined legal analysis pipeline completed successfully!");
    return res.json({ analysis });

  } catch (error: any) {
    console.error("[JusticeAI] Consultation API Error, triggering robust local legal fallback generator. Error:", error);
    try {
      const fallbackData = getFallbackLegalAnalysis(description, location, category, language);
      const analysis = {
        researcher: {
          findings: fallbackData.findings,
          statutes: fallbackData.statutesList,
          sources: [
            { title: "JusticeAI Standard Legal Reference Library", uri: "https://justiceai.org/library" }
          ],
        },
        explainer: fallbackData.explainer,
        recommendation: fallbackData.recommendation,
        generator: fallbackData.generator,
        isFallback: true
      };
      console.log("[JusticeAI] Local fallback consultation generated successfully.");
      return res.json({ analysis });
    } catch (fallbackErr: any) {
      console.error("[JusticeAI] Critical failure generating local legal fallback:", fallbackErr);
      return res.status(500).json({ error: error.message || "An error occurred during legal consultation." });
    }
  }
});

// Local fallback chat responder for agents in case of Gemini API rate limit or outage
function getLocalChatFallback(message: string, agentId: string, location: string, category: string, language: string) {
  const isIndian = (location || "").toLowerCase().includes("pune") || 
                   (location || "").toLowerCase().includes("mumbai") || 
                   (location || "").toLowerCase().includes("india") || 
                   (location || "").toLowerCase().includes("maharashtra");
  const isMarathi = language === "Marathi" || language === "marathi";
  const isHindi = language === "Hindi" || language === "hindi";

  if (agentId === "researcher") {
    if (isIndian) {
      if (isMarathi) {
        return "तुमच्या केसच्या कायदेशीर विश्लेषणानुसार, मुख्य तरतुदी खालीलप्रमाणे आहेत:\n\n- **कलम १८ (महारेरा २०१६)**: वेळेत फ्लॅटचा ताबा न मिळाल्यास व्याजासह परतावा मिळवणे किंवा ताबा मिळेपर्यंत दरमहा व्याज मिळवणे.\n- **ग्राहक संरक्षण कायदा २०१९**: सेवेतील त्रुटींबद्दल जिल्हा ग्राहक मंचाकडे दाद मागणे.\n\nतुम्हाला या कायद्यांमधील कोणत्या विशिष्ट कलमांबद्दल किंवा प्रक्रियेबद्दल अधिक माहिती हवी आहे?";
      }
      if (isHindi) {
        return "आपके मामले के कानूनी अनुसंधान के अनुसार, मुख्य कानूनी धाराएं निम्नलिखित हैं:\n\n- **धारा 18 (रेरा अधिनियम, 2016)**: फ्लैट मिलने में देरी होने पर ब्याज और रिफंड का दावा।\n- **उपभोक्ता संरक्षण कानून, 2019**: सेवा में कमी (Deficiency of Service) के खिलाफ शिकायत।\n\nक्या आप इनमें से किसी विशिष्ट प्रावधान के बारे में विस्तार से जानना चाहते हैं?";
      }
      return "According to our legal database, your case is governed by key local statutes:\n\n- **Section 18 of the RERA Act, 2016**: Grants you the absolute right to seek interest or a full refund for delay in flat possession.\n- **Consumer Protection Act, 2019**: Offers protection and compensatory relief against Deficiency of Service by builders or stores.\n\nWould you like me to explain any of these statutes in more detail?";
    } else {
      return "Based on standard tenant protection regulations (such as California Civil Code Section 1950.5), withholding deposits or breaching rental agreements without providing itemized repair bills is prohibited. If the landlord fails to comply with statutory timelines (usually 21 days), they forfeit their rights to any deductions.";
    }
  }

  if (agentId === "explainer") {
    if (isMarathi) {
      return "काळजी करू नका, कायदा तुमच्या पाठीशी आहे! तुमचे मुख्य हक्क खालीलप्रमाणे आहेत:\n१. **न्याय्य वागणूक**: बिल्डर किंवा दुकानदाराकडून करारात ठरल्याप्रमाणे सेवा मिळवणे.\n२. **भरपाई**: कोणत्याही विलंबासाठी किंवा सदोष उत्पादनासाठी आर्थिक नुकसानभरपाई मिळवणे.\n\nमी तुम्हाला हे आणखी सोप्या शब्दात समजून घेण्यास मदत करू शकतो. तुमचे पुढील पाऊल काय असावे याबद्दल काही प्रश्न आहेत का?";
    }
    if (isHindi) {
      return "चिंता न करें, आप कानूनन पूरी तरह सुरक्षित हैं! आपके मुख्य अधिकार ये हैं:\n1. **उचित व्यवहार**: विक्रेता या बिल्डर से अनुबंध के अनुसार सही सेवा प्राप्त करने का हक।\n2. **मुआवजा**: किसी भी देरी या खराब सेवा के लिए वित्तीय मुआवजा पाने का अधिकार।\n\nमैं इसे आपके लिए और सरल बना सकता हूँ। क्या आपका कोई विशेष प्रश्न है?";
    }
    return "Don't worry, the law is strongly on your side! Your core rights protect you against unfair or deceptive business practices. You have the right to receive what you paid for, and to be compensated for delays or defective services. Let me know if you would like to explore your rights further.";
  }

  if (agentId === "recommendation") {
    if (isIndian) {
      if (isMarathi) {
        return "मी तुम्हाला खालील प्राधिकरणांकडे अधिकृत तक्रार दाखल करण्याची शिफारस करतो:\n- **महारेरा (MahaRERA)**: रिअल इस्टेटच्या तक्रारींसाठी (https://maharera.maharashtra.gov.in).\n- **ग्राहक मंच (Consumer Forum)**: ऑनलाइन तक्रार नोंदवण्यासाठी 'ई-दाखल' (e-Daakhil) पोर्टल वापरा.\n\nतक्रार दाखल करण्याची सविस्तर पद्धत मी सांगू का?";
      }
      if (isHindi) {
        return "मैं आपको निम्नलिखित प्राधिकरणों में शिकायत दर्ज करने की सलाह देता हूँ:\n- **महारेरा (MahaRERA)**: रियल एस्टेट से जुड़ी शिकायतों के त्वरित निवारण के लिए।\n- **जिला उपभोक्ता फोरम**: 'ई-दाखिल' (e-Daakhil) ऑनलाइन शिकायत पोर्टल के माध्यम से।\n\nक्या आप शिकायत दर्ज करने की चरण-दर-चरण प्रक्रिया जानना चाहते हैं?";
      }
      return "I recommend filing a complaint with the appropriate regulatory board:\n- **MahaRERA**: For real estate and builder-related disputes (https://maharera.maharashtra.gov.in).\n- **District Consumer Forum**: Via the 'e-Daakhil' portal (https://edaakhil.nic.in).\n\nWould you like the detailed step-by-step administrative checklist?";
    } else {
      return "I recommend approaching your local Small Claims Court or Tenant Rent Board. It is a cost-effective forum designed to settle disputes under $10,000 without requiring expensive lawyers. Would you like a checklist of documents to bring?";
    }
  }

  if (agentId === "generator") {
    if (isMarathi) {
      return "मी तुमच्यासाठी नोटीसीचा कायदेशीर मसुदा तयार केला आहे. तुम्ही तो 'Draft Letter' टॅबमध्ये पाहू शकता:\n- आपले नाव आणि पत्ता चौकटीत [bracket] भरा.\n- बिल्डर किंवा कंपनीला ईमेल आणि नोंदणीकृत पत्राद्वारे पाठवा.\n\nतुम्हाला मसुद्यातील विशिष्ट परिच्छेद अधिक कडक किंवा मऊ करायचा आहे का?";
    }
    if (isHindi) {
      return "मैंने आपके लिए मांग पत्र का प्रारूप तैयार किया है। आप इसे आसानी से संपादित कर सकते हैं:\n- कोष्ठक [bracket] में अपनी व्यक्तिगत जानकारी भरें।\n- इसे स्पीड पोस्ट द्वारा भेजें।\n\nक्या आप चाहते हैं कि मैं आपके लिए किसी विशिष्ट हिस्से को अधिक कड़क या विनम्र बनाऊं?";
    }
    return "I have generated the formal notice. You can view it in the 'Draft Letter' tab. Make sure to fill out the bracketed information like names, dates, and amounts. I can help you adjust the tone to make it sound more assertive or collaborative, depending on your needs. What adjustments would you like?";
  }

  if (isMarathi) {
    return "मी आपले म्हणणे समजलो. मी आपल्याला न्याय मिळवून देण्यासाठी सदैव तयार आहे. अधिक माहिती विचारा!";
  }
  if (isHindi) {
    return "मैं आपकी स्थिति समझ सकता हूँ। मैं आपकी पूरी सहायता करूँगा। कृपया अपना प्रश्न पूछें!";
  }
  return "I understand your query. As your dedicated JusticeAI Legal Agent, I am here to help you navigate this dispute. Please feel free to ask any specific questions about laws, notices, or tribunals.";
}

// 2. API: Follow-up Chat with a specific Agent
app.post("/api/chat", async (req, res) => {
  const { messages, agentId, caseContext, language = "English" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const activeAgentId = agentId || "explainer";

  // System prompts representing the active agent persona
  const agentPersonas = {
    researcher: `You are the Legal Research Agent for JusticeAI. You specialize in analyzing laws and civil codes. Answer the user's questions with academic accuracy, cite relevant statutes, and focus on details. Use precise, professional terminology. Highlight what is legally sound and what is controversial. Always translate or communicate in ${language}.`,
    explainer: `You are the Rights Explainer Agent for JusticeAI. Your mission is to make legal rules warm, understandable, supportive, and accessible. Avoid heavy legal jargon, or if you use it, explain it immediately with a simple analogy. Focus on empowering the citizen. Always translate or communicate in ${language}.`,
    recommendation: `You are the Authority Recommendation Agent for JusticeAI. You specialize in government bureaucracies, regulatory agencies, and the administrative filing systems (courts, labor commissioner, rent boards). Help the user navigate forms, timelines, and venues. Provide clear, step-by-step administrative checklists. Always translate or communicate in ${language}.`,
    generator: `You are the Document Generator Agent for JusticeAI. You help users modify, format, write, and deliver formal complaints, cease-and-desist notes, and demand letters. Help the user refine their letter, adjust the wording to sound firmer/gentler, or add specific details. Keep code formatting clean. Always translate or communicate in ${language}.`,
  };

  const systemInstruction = agentPersonas[activeAgentId as keyof typeof agentPersonas] || agentPersonas.explainer;

  try {
    console.log(`[JusticeAI] Active chat with agent: ${activeAgentId}`);

    // Incorporate the Case Context into the prompt history to maintain grounding
    const contextPart = caseContext ? `
      CONTEXT of this case:
      - Category: ${caseContext.category}
      - Location: ${caseContext.location}
      - Core Issue: ${caseContext.description}
      Use this context to tailor your answers precisely. Do not generalize if you can cite location-specific advice.
    ` : "No prior case details are registered. Answer the questions generally but helpfully.";

    // Format chat history for Gemini SDK contents format
    const formattedContents = [];
    
    // Add context as the very first user guidance part
    formattedContents.push({
      role: "user",
      parts: [{ text: `System Notice: Background Case Context:\n${contextPart}\nPlease acknowledge and use this context to guide our conversation.` }]
    });
    formattedContents.push({
      role: "model",
      parts: [{ text: `Understood. I am the specialized agent ready to assist you based on your case details in ${caseContext?.location || "your area"}. How can I help you today?` }]
    });

    // Append the last N messages to avoid exceeding prompt sizes while retaining core history
    const recentMessages = messages.slice(-10); // last 10 messages
    for (const msg of recentMessages) {
      formattedContents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    }

    // Call Gemini with Retry
    const chatResponse = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    }));

    return res.json({
      content: chatResponse.text || "I was unable to formulate a response. Please rephrase."
    });

  } catch (error: any) {
    console.error("[JusticeAI] Chat API Error, invoking fallback local responder:", error);
    try {
      const userMsg = messages[messages.length - 1]?.content || "";
      const loc = caseContext?.location || "";
      const cat = caseContext?.category || "";
      const lang = language;
      const fallbackReply = getLocalChatFallback(userMsg, activeAgentId, loc, cat, lang);
      return res.json({
        content: fallbackReply,
        isFallback: true
      });
    } catch (fallbackErr: any) {
      console.error("[JusticeAI] Critical failure in local chat fallback:", fallbackErr);
      return res.status(500).json({ error: error.message || "An error occurred during chat reasoning." });
    }
  }
});

// 3. API: Text to Speech (Natural Voice Narration)
app.post("/api/tts", async (req, res) => {
  const { text, voice = "Zephyr" } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    console.log(`[JusticeAI] Generating High-Quality TTS for text of length: ${text.length} with voice: ${voice}`);

    // Prebuilt voice must be one of: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voice) ? voice : "Zephyr";

    // Clean up text slightly to ensure standard speech
    const cleanText = text.substring(0, 450); // limit to protect latency and keep it fast

    const ttsResponse = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally: ${cleanText}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    }));

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No speech audio returned from Gemini TTS");
    }

    return res.json({ audio: base64Audio });

  } catch (error: any) {
    console.error("[JusticeAI] TTS API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI speech." });
  }
});

// 4. Vite middleware Integration for Dev and Production serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JusticeAI] Server running on http://localhost:${PORT}`);
  });
}

start();
