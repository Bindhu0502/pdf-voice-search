import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "./App.css";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/*
=========================================================
PDF.JS WORKER
=========================================================
*/

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


/*
=========================================================
QUESTION ALIASES

The interviewer may ask the same question using
different words.

Example:

PDF:
"What would you do if a customer is angry?"

Interviewer:
"How would you handle an upset customer?"

Both should point to the same question.
=========================================================
*/

const QUESTION_ALIASES = {

  1: [
    "tell me about yourself",
    "introduce yourself",
    "tell me about your background",
    "tell me about your education",
    "describe yourself",
    "give me your introduction",
    "walk me through yourself",
  ],

  2: [
    "walk me through your resume",
    "explain your resume",
    "tell me about your resume",
    "go through your resume",
    "describe your resume",
  ],

  3: [
    "why amazon",
    "why do you want to join amazon",
    "why do you want to work at amazon",
    "why do you want to work for amazon",
    "why are you interested in amazon",
    "why did you choose amazon",
    "why this company",
  ],

  4: [
    "what do you know about amazon",
    "tell me about amazon",
    "what can you tell me about amazon",
    "what do you know about the company",
  ],

  5: [
    "why customer service",
    "why do you want customer service",
    "why are you interested in customer service",
    "why did you choose customer service",
    "why customer support",
  ],

  6: [
    "why should we hire you",
    "why should amazon hire you",
    "why should we select you",
    "why are you suitable",
    "why are you a good fit",
    "why are you the right candidate",
    "what makes you suitable",
  ],

  7: [
    "what are your strengths",
    "what are your strong points",
    "what are your best qualities",
    "what are you good at",
  ],

  8: [
    "what are your weaknesses",
    "what is your weakness",
    "what do you need to improve",
    "what are your areas of improvement",
  ],

  9: [
    "what motivates you",
    "what is your motivation",
    "what keeps you motivated",
    "what drives you",
  ],

  10: [
    "where do you see yourself in five years",
    "where will you be in five years",
    "what are your future goals",
    "what are your career goals",
    "where do you see yourself in the future",
  ],

  11: [
    "what are your hobbies",
    "what do you do in your free time",
    "what are your interests",
    "what do you like doing",
  ],

  12: [
    "describe yourself in three words",
    "describe yourself in three words",
    "three words to describe yourself",
  ],

  13: [
    "what makes you different",
    "what makes you unique",
    "what makes you stand out",
    "why are you different",
  ],

  14: [
    "what is your biggest achievement",
    "biggest accomplishment",
    "greatest achievement",
    "most important achievement",
  ],

  15: [
    "tell me about your family",
    "describe your family",
    "tell me about your family background",
  ],

  16: [
    "why did you choose this career",
    "why this career",
    "why did you choose this career path",
  ],

  17: [
    "are you willing to relocate",
    "can you relocate",
    "are you comfortable relocating",
    "would you move for the job",
  ],

  18: [
    "are you comfortable with rotational shifts",
    "can you work rotational shifts",
    "are you okay with rotational shifts",
    "can you work different shifts",
  ],

  19: [
    "can you work night shifts",
    "are you comfortable with night shifts",
    "can you work at night",
    "are you okay working nights",
  ],

  20: [
    "can you work weekends",
    "can you work holidays",
    "are you comfortable working weekends",
    "can you work on weekends",
  ],

  21: [
    "how do you handle pressure",
    "how do you work under pressure",
    "how do you deal with pressure",
    "how do you manage pressure",
    "how do you handle stressful situations",
  ],

  22: [
    "what are your salary expectations",
    "what salary do you expect",
    "how much salary do you expect",
    "what are your pay expectations",
  ],

  23: [
    "when can you join",
    "when can you start",
    "when are you available to join",
    "how soon can you join",
    "are you available immediately",
  ],

  24: [
    "why should we not reject you",
    "why should we select you",
    "why should we give you this opportunity",
  ],

  25: [
    "do you have any questions for us",
    "do you have questions",
    "would you like to ask anything",
    "do you want to ask us anything",
  ],

  26: [
    "what is customer service",
    "define customer service",
    "explain customer service",
    "what does customer service mean",
  ],

  27: [
    "what if customer rejects your solution",
    "customer does not accept your solution",
    "customer refuses your solution",
    "customer disagrees with your solution",
  ],

  28: [
    "what makes good customer service",
    "what makes excellent customer service",
    "how do you provide excellent customer service",
  ],

  29: [
    "what is customer satisfaction",
    "define customer satisfaction",
    "what does customer satisfaction mean",
  ],

  30: [
    "what is customer delight",
    "define customer delight",
    "what does customer delight mean",
  ],

  31: [
    "who is a satisfied customer",
    "what is a satisfied customer",
    "define satisfied customer",
  ],

  32: [
    "what is empathy",
    "define empathy",
    "explain empathy",
    "what does empathy mean",
  ],

  33: [
    "difference between empathy and sympathy",
    "empathy versus sympathy",
    "empathy vs sympathy",
    "how is empathy different from sympathy",
  ],

  34: [
    "difference between customer service and customer support",
    "customer service versus customer support",
    "customer service vs customer support",
  ],

  35: [
    "what is active listening",
    "define active listening",
    "explain active listening",
  ],

  36: [
    "why is active listening important",
    "importance of active listening",
    "why do we need active listening",
  ],

  37: [
    "why is patience important",
    "why patience is important in customer service",
    "why should customer service agents be patient",
  ],

  38: [
    "why is communication important",
    "importance of communication",
    "why communication matters",
  ],

  39: [
    "what qualities should a customer service associate have",
    "qualities of customer service",
    "skills required for customer service",
    "what skills are needed for customer service",
  ],

  40: [
    "how do you build trust with customers",
    "how do you gain customer trust",
    "how do you earn customer trust",
  ],

  41: [
    "why is customer feedback important",
    "why feedback is important",
    "importance of customer feedback",
  ],

  42: [
    "what is professionalism",
    "define professionalism",
    "what does professionalism mean",
  ],

  43: [
    "how would you apologize to a customer",
    "how do you apologize to customers",
    "what would you say when apologizing",
  ],

  44: [
    "what should you never do with a customer",
    "what should you not do with customers",
    "what should customer service agents avoid",
  ],

  45: [
    "what is customer obsession",
    "explain customer obsession",
    "what does customer obsession mean",
  ],

  46: [
    "why do customers choose amazon",
    "why do people choose amazon",
    "why customers use amazon",
  ],

  47: [
    "what if you don't know the answer",
    "what if you do not know the answer",
    "what would you do if you don't know",
    "what if you cannot answer the customer",
  ],

  48: [
    "how do you handle a confused customer",
    "what if customer is confused",
    "how would you help a confused customer",
    "customer doesn't understand",
  ],

  49: [
    "how do you ensure customer satisfaction",
    "how do you make customers satisfied",
    "how do you know the customer is satisfied",
  ],

  50: [
    "why should customers trust you",
    "why can customers trust you",
    "how would you earn customer trust",
  ],

  51: [
    "most important quality in customer service",
    "most important skill for customer service",
    "what quality is important in customer service",
  ],

  52: [
    "what if you don't understand the customer's problem",
    "what if you don't understand customer",
    "customer problem is unclear",
    "how do you clarify customer issue",
  ],

  53: [
    "why is honesty important",
    "importance of honesty in customer service",
    "why should customer service be honest",
  ],

  54: [
    "what is excellent customer service",
    "define excellent customer service",
    "explain excellent customer service",
  ],

  55: [
    "how can you improve a customer's experience",
    "how do you improve customer experience",
    "how can you improve customer experience",
  ],

  56: [
    "why are you suitable for customer service",
    "why are you fit for customer service",
    "why are you a good fit for customer service",
  ],

  /*
  =======================================================
  CUSTOMER HANDLING
  =======================================================
  */

  57: [
    "how would you handle an angry customer",
    "what would you do with an angry customer",
    "how do you deal with an upset customer",
    "what if customer is frustrated",
    "how would you handle a frustrated customer",
    "how do you handle difficult customers",
    "what if customer gets angry",
    "how would you deal with an upset customer",
  ],

  58: [
    "what if customer starts shouting",
    "what if customer is yelling",
    "customer is screaming",
    "customer raises their voice",
    "customer is shouting at you",
  ],

  59: [
    "what if customer uses abusive language",
    "customer is abusive",
    "customer uses bad language",
    "customer insults you",
    "customer behaves abusively",
  ],

  60: [
    "what if customer is crying",
    "customer starts crying",
    "how would you handle emotional customer",
    "customer is emotional",
  ],

  61: [
    "customer keeps interrupting",
    "what if customer interrupts you",
    "customer doesn't let you speak",
    "customer keeps talking",
  ],

  62: [
    "what if you don't know the answer",
    "what if you are unsure about an answer",
    "what if you cannot answer",
    "you don't know something",
  ],

  63: [
    "what if you give wrong information",
    "what if you make a mistake with a customer",
    "what if you accidentally give incorrect information",
  ],

  64: [
    "what if your system stops working",
    "system crashes during call",
    "computer stops working during call",
    "technical issue during customer call",
  ],

  65: [
    "customer wants manager",
    "customer asks for supervisor",
    "customer wants to speak to manager",
    "customer requests manager",
  ],

  66: [
    "customer refuses to listen",
    "customer won't listen",
    "customer does not listen",
    "customer is not listening",
  ],

  67: [
    "customer is not satisfied with solution",
    "customer doesn't like your solution",
    "customer is unhappy with your solution",
    "customer says solution is not enough",
  ],

  68: [
    "put customer on hold",
    "place customer on hold",
    "how do you put someone on hold",
    "what do you say before hold",
  ],

  69: [
    "how would you apologize",
    "how do you apologize to customer",
    "what do you say to apologize",
  ],

  70: [
    "how do you calm an upset customer",
    "how would you calm an angry customer",
    "how do you calm down customer",
    "how do you reduce customer frustration",
  ],

  71: [
    "what if customer is rude",
    "how do you deal with rude customer",
    "customer behaves rudely",
    "customer is disrespectful",
  ],

  72: [
    "customer asks something against policy",
    "customer wants something not allowed",
    "customer requests exception to policy",
    "what if customer asks for something against rules",
  ],

  73: [
    "several customers are waiting",
    "many customers are waiting",
    "multiple customers need help",
    "how do you handle many customers",
  ],

  74: [
    "customer asks same question repeatedly",
    "customer keeps asking the same question",
    "customer repeats the question",
  ],

  75: [
    "how do you end difficult customer conversation",
    "how do you close a difficult call",
    "how do you end a difficult call",
  ],

  76: [
    "issue cannot be resolved immediately",
    "problem cannot be solved right away",
    "what if you cannot resolve the issue",
    "what if resolution takes time",
  ],

  /*
  =======================================================
  SHOPPING
  =======================================================
  */

  77: [
    "order is delayed",
    "package is late",
    "delivery is late",
    "order hasn't arrived on time",
    "customer says delivery is late",
    "my order is late",
    "my package is delayed",
  ],

  78: [
    "received wrong product",
    "got wrong item",
    "wrong item was delivered",
    "received incorrect product",
    "amazon sent wrong product",
  ],

  79: [
    "received damaged product",
    "item arrived damaged",
    "product is broken",
    "received broken item",
  ],

  80: [
    "haven't received refund",
    "refund not received",
    "where is my refund",
    "refund is delayed",
    "money has not come back",
  ],

  81: [
    "payment deducted but order not placed",
    "money deducted but order failed",
    "payment taken but order not created",
    "charged but order wasn't placed",
    "money taken from account but no order",
  ],

  82: [
    "forgot amazon password",
    "forgot my password",
    "cannot login to amazon",
    "can't access my account",
    "password reset",
  ],

  83: [
    "cancel my order",
    "want to cancel order",
    "need to cancel purchase",
    "how can I cancel my order",
  ],

  84: [
    "package says delivered but not received",
    "order shows delivered but I don't have it",
    "delivery says delivered but package missing",
    "marked delivered but not received",
  ],

  85: [
    "customer wants compensation",
    "want compensation for problem",
    "can I get compensation",
    "customer asks for compensation",
  ],

  86: [
    "not happy with amazon",
    "disappointed with amazon",
    "customer is disappointed",
    "customer says amazon is bad",
  ],

  87: [
    "tell me about your experience",
    "tell me about your academic experience",
    "tell me about your college experience",
  ],

  88: [
    "tell me about a time you helped someone",
    "give an example of helping someone",
    "when did you help someone",
    "example where you supported someone",
  ],

  89: [
    "tell me about a time you took ownership",
    "example of ownership",
    "when did you take responsibility",
    "tell me about a responsibility you took",
  ],

  90: [
    "tell me about a time you learned something quickly",
    "example of learning quickly",
    "when did you learn something fast",
    "how quickly have you learned something",
  ],

  91: [
    "tell me about a difficult situation",
    "describe a difficult situation",
    "example of a difficult situation",
    "tell me about a tough situation",
  ],

  92: [
    "tell me about a problem you solved",
    "give an example of problem solving",
    "when did you solve a problem",
    "describe a problem you solved",
  ],

  93: [
    "tell me about a conflict in a team",
    "team conflict example",
    "tell me about disagreement with teammate",
    "when did you have conflict in team",
    "how did you resolve team disagreement",
  ],

  94: [
    "tell me about a mistake you made",
    "describe a mistake",
    "example of a mistake",
    "when did you make a mistake",
  ],

  95: [
    "tell me about your biggest achievement",
    "greatest achievement",
    "biggest accomplishment",
    "most important achievement",
  ],

  96: [
    "tell me about a time you worked under pressure",
    "example of working under pressure",
    "when did you work under pressure",
    "pressure situation example",
  ],

  97: [
    "tell me about a challenge you faced",
    "describe a challenge",
    "example of a challenge",
    "difficult challenge you faced",
  ],

  98: [
    "tell me about receiving feedback",
    "how did you receive feedback",
    "example of feedback",
    "tell me about feedback you received",
  ],

  99: [
    "tell me about a goal you achieved",
    "example of achieving a goal",
    "what goal did you achieve",
  ],

  100: [
    "tell me about a time you worked in a team",
    "teamwork example",
    "example of working with a team",
    "when did you work as part of a team",
  ],

  101: [
    "tell me about a failure",
    "describe a failure",
    "example of failure",
    "when did you fail",
  ],

  102: [
    "tell me about a time you went above and beyond",
    "example of going above and beyond",
    "when did you do extra work",
    "when did you go beyond your responsibility",
  ],

  103: [
    "tell me about a responsibility you handled",
    "example of responsibility",
    "what responsibility did you handle",
  ],

  104: [
    "tell me about adapting to change",
    "example of adapting to change",
    "when did you adapt to change",
    "how did you handle change",
  ],

  105: [
    "tell me about explaining something to someone",
    "example of explaining something",
    "when did you teach someone",
    "when did you explain something clearly",
  ],

  106: [
    "why should amazon hire you",
    "why should amazon select you",
    "why are you the right person for amazon",
    "why should amazon choose you",
  ],

  /*
  =======================================================
  SHOPPING SCENARIOS
  =======================================================
  */

  107: [
    "order is delayed",
    "package is late",
    "delivery is late",
    "my order hasn't arrived",
    "where is my order",
    "my package is delayed",
  ],

  108: [
    "received wrong product",
    "wrong product received",
    "got the wrong item",
    "wrong item delivered",
  ],

  109: [
    "product is damaged",
    "damaged product",
    "item arrived damaged",
    "product is broken",
  ],

  110: [
    "haven't received refund",
    "refund not received",
    "where is my refund",
    "refund hasn't arrived",
  ],

  111: [
    "payment was deducted but order wasn't placed",
    "money deducted but order not placed",
    "payment deducted no order",
    "charged but order failed",
  ],

  112: [
    "forgot my password",
    "forgot amazon password",
    "cannot login",
    "can't access my account",
  ],

  113: [
    "want to cancel my order",
    "cancel my order",
    "need to cancel order",
  ],

  114: [
    "change delivery address",
    "change my address",
    "update delivery address",
    "wrong delivery address",
  ],

  115: [
    "package shows delivered but didn't receive",
    "package says delivered but not received",
    "marked delivered but missing",
    "delivery says delivered but I don't have it",
  ],

  116: [
    "received empty package",
    "package was empty",
    "box was empty",
    "nothing was inside package",
  ],

  117: [
    "delivery executive was rude",
    "delivery person was rude",
    "driver was rude",
    "delivery agent behaved badly",
  ],

  118: [
    "received fewer items",
    "missing items from order",
    "some items are missing",
    "not all items arrived",
  ],

  119: [
    "want compensation",
    "asking for compensation",
    "want money for inconvenience",
  ],

  120: [
    "want to speak with manager",
    "speak to supervisor",
    "talk to manager",
    "customer wants supervisor",
  ],

  121: [
    "not happy with amazon",
    "unhappy with amazon",
    "disappointed with company",
  ],

  122: [
    "want order today",
    "need order today",
    "customer demands same day delivery",
    "wants delivery immediately",
  ],

  123: [
    "ordered wrong product",
    "ordered wrong item",
    "customer bought wrong product",
  ],

  124: [
    "price changed after order",
    "price increased after purchase",
    "product price changed",
    "price is different after ordering",
  ],

  125: [
    "accidentally placed two orders",
    "duplicate order",
    "ordered twice",
    "two identical orders",
  ],

  126: [
    "don't understand return process",
    "how do I return an item",
    "customer doesn't know how to return",
    "return procedure",
  ],

  /*
  =======================================================
  COMMUNICATION
  =======================================================
  */

  127: [
    "how will you greet customer",
    "how do you greet a customer",
    "what is your opening greeting",
    "how do you start a customer call",
  ],

  128: [
    "how do you verify customer details",
    "how do you verify identity",
    "customer verification",
    "security verification",
  ],

  129: [
    "how do you build rapport",
    "how do you connect with customer",
    "how do you create a good relationship",
  ],

  130: [
    "how do you communicate with angry customer",
    "how do you talk to angry customer",
    "how do you speak to frustrated customer",
  ],

  131: [
    "how do you explain something to confused customer",
    "customer doesn't understand explanation",
    "how do you explain clearly",
  ],

  132: [
    "how do you put customer on hold",
    "what do you say before putting on hold",
  ],

  133: [
    "what do you say after returning from hold",
    "what do you say after hold",
    "customer was waiting on hold",
  ],

  134: [
    "how do you transfer a call",
    "how do you transfer customer",
    "transfer customer to another department",
  ],

  135: [
    "how do you close customer call",
    "how do you end customer call",
    "what do you say at the end of call",
  ],

  136: [
    "what tone should you use",
    "what should your voice sound like",
    "how should you speak to customer",
    "what tone is appropriate",
  ],

  137: [
    "why is communication important",
    "importance of communication in customer service",
  ],

  138: [
    "why is listening important",
    "importance of listening",
    "why should you listen to customers",
  ],

  139: [
    "what if you cannot understand customer",
    "customer is difficult to understand",
    "what if you don't understand what customer says",
  ],

  140: [
    "customer cannot understand you",
    "customer doesn't understand your explanation",
    "how do you make customer understand",
  ],

  141: [
    "language barrier",
    "customer speaks different language",
    "difficulty understanding language",
  ],

  142: [
    "what should you avoid while speaking",
    "what should you not do on a call",
    "communication mistakes to avoid",
  ],

  143: [
    "important communication skills",
    "communication skills needed",
    "what communication skills do you have",
  ],

  144: [
    "how do you handle silence on a call",
    "what do you do during silence",
    "long silence during customer call",
  ],

  145: [
    "what if call gets disconnected",
    "customer call disconnects",
    "call drops",
    "what do you do if call drops",
  ],

  146: [
    "how do you speak confidently",
    "how can you sound confident",
    "how do you improve confidence while speaking",
  ],

  /*
  =======================================================
  ONE-MINUTE TOPICS
  =======================================================
  */

  147: [
    "speak about amazon",
    "one minute about amazon",
    "talk about amazon",
    "speak on amazon",
  ],

  148: [
    "speak about customer service",
    "talk about customer service",
    "one minute on customer service",
  ],

  149: [
    "speak about online shopping",
    "talk about online shopping",
    "one minute on online shopping",
  ],

  150: [
    "speak about your favourite color",
    "favorite color",
    "favourite colour",
    "talk about your favorite color",
  ],

  151: [
    "speak about your hometown",
    "tell me about your hometown",
    "talk about your hometown",
    "describe your hometown",
  ],

  152: [
    "speak about artificial intelligence",
    "talk about ai",
    "one minute about artificial intelligence",
  ],

  153: [
    "speak about teamwork",
    "talk about teamwork",
    "one minute on teamwork",
  ],

  /*
  =======================================================
  WORK ENVIRONMENT
  =======================================================
  */

  154: [
    "comfortable working night shifts",
    "can you work night shifts",
    "are you okay with night shifts",
  ],

  155: [
    "comfortable working rotational shifts",
    "can you work rotational shifts",
    "are you okay with rotational shifts",
  ],

  156: [
    "comfortable working weekends",
    "can you work weekends",
    "are you okay working weekends",
  ],

  157: [
    "can you work under pressure",
    "comfortable working under pressure",
    "can you handle pressure",
  ],

  158: [
    "how do you handle stress",
    "how do you manage stress",
    "how do you deal with stress",
  ],

  159: [
    "are you comfortable meeting targets",
    "can you meet targets",
    "comfortable with targets",
    "can you achieve targets",
  ],

  160: [
    "can you multitask",
    "are you comfortable multitasking",
    "can you handle multiple tasks",
    "how do you manage multiple tasks",
  ],

  161: [
    "can you work in a team",
    "are you a team player",
    "do you like teamwork",
    "how well do you work with others",
  ],

  162: [
    "are you comfortable learning new software",
    "can you learn new software",
    "can you learn new tools",
    "are you comfortable with new technology",
  ],

  163: [
    "teammate asks for help while busy",
    "what if teammate needs help",
    "colleague asks for help when busy",
  ],

  164: [
    "disagree with team leader",
    "what if you disagree with manager",
    "disagreement with supervisor",
    "manager makes a decision you disagree with",
  ],

  165: [
    "what if you make a mistake",
    "what do you do when you make a mistake",
    "how do you handle your mistakes",
    "what if you make an error",
  ],

  166: [
    "what if teammate makes a mistake",
    "teammate makes an error",
    "how would you handle teammate mistake",
  ],

  167: [
    "why is teamwork important",
    "importance of teamwork",
    "why teamwork matters",
  ],

  168: [
    "how do you prioritize your work",
    "how do you prioritize tasks",
    "how do you decide what task to do first",
    "how do you manage priorities",
  ],

  169: [
    "manager gives urgent work",
    "what if manager gives urgent task",
    "boss gives you urgent work",
    "how do you handle urgent work",
  ],

  170: [
    "how do you accept feedback",
    "how do you handle feedback",
    "what do you do with criticism",
    "how do you respond to feedback",
  ],

  171: [
    "are you a quick learner",
    "do you learn quickly",
    "how quickly can you learn",
    "are you good at learning new things",
  ],

  172: [
    "why should customers trust you",
    "why can customers trust you",
    "how would you earn customer trust",
  ],

  173: [
    "why should amazon trust you",
    "why can amazon trust you",
    "why should the company trust you",
  ],

  174: [
    "what are your career goals",
    "what are your long term goals",
    "what do you want to achieve in your career",
  ],

  175: [
    "what would you do on your first day",
    "what would you do on first day at amazon",
    "how would you start your first day",
  ],

  176: [
    "why do you want this job",
    "why do you want this position",
    "why are you interested in this job",
    "why did you apply for this job",
  ],

  177: [
    "why did you apply for this role",
    "why did you apply for this position",
    "why this role",
    "why did you choose this role",
  ],

  178: [
    "how to handle late delivery",
    "what would you do if delivery was late",
    "customer has late delivery",
    "how would you handle delayed delivery",
    "package is late",
  ],

  179: [
    "customer demands something against policy",
    "customer asks for something against policy",
    "customer wants an exception",
    "how do you refuse customer politely",
  ],

  180: [
    "challenges you faced as team lead",
    "team lead challenges",
    "what challenges did you face as a team leader",
    "experience as team lead",
  ],

  181: [
    "how did you prepare presentation on time",
    "what steps did you take to prepare presentation",
    "how did you make sure presentation was ready",
  ],
};


/*
=========================================================
TEXT NORMALIZATION
=========================================================
*/

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "am",
  "be",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "with",
  "my",
  "your",
  "you",
  "me",
  "i",
  "do",
  "does",
  "did",
  "how",
  "what",
  "why",
  "would",
  "could",
  "can",
  "should",
  "will",
  "about",
  "tell",
  "please",
  "if",
  "when",
  "where",
  "from",
  "this",
  "that",
  "it",
  "have",
  "has",
  "had",
]);

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulWords(text = "") {
  return normalizeText(text)
    .split(" ")
    .filter(
      (word) =>
        word.length > 1 &&
        !STOP_WORDS.has(word)
    );
}


/*
=========================================================
WORD SIMILARITY
=========================================================
*/

function wordSimilarity(
  textA,
  textB
) {
  const wordsA = new Set(
    meaningfulWords(textA)
  );

  const wordsB = new Set(
    meaningfulWords(textB)
  );

  if (
    wordsA.size === 0 ||
    wordsB.size === 0
  ) {
    return 0;
  }

  let matches = 0;

  wordsA.forEach((word) => {
    if (wordsB.has(word)) {
      matches++;
    }
  });

  return (
    matches /
    Math.max(
      wordsA.size,
      wordsB.size
    )
  );
}


/*
=========================================================
ALIAS MATCHING
=========================================================
*/

function aliasSimilarity(
  spokenText,
  aliases
) {
  if (
    !spokenText ||
    !aliases ||
    aliases.length === 0
  ) {
    return 0;
  }

  const spoken =
    normalizeText(
      spokenText
    );

  let best = 0;

  aliases.forEach((alias) => {
    const normalizedAlias =
      normalizeText(alias);

    /*
      Exact match
    */

    if (
      spoken === normalizedAlias
    ) {
      best = Math.max(
        best,
        1
      );
      return;
    }

    /*
      Full phrase inside sentence
    */

    if (
      spoken.includes(
        normalizedAlias
      )
    ) {
      best = Math.max(
        best,
        0.95
      );
      return;
    }

    /*
      Word-level comparison
    */

    const spokenWords =
      new Set(
        meaningfulWords(
          spoken
        )
      );

    const aliasWords =
      meaningfulWords(
        normalizedAlias
      );

    if (
      spokenWords.size === 0 ||
      aliasWords.length === 0
    ) {
      return;
    }

    let matches = 0;

    aliasWords.forEach(
      (word) => {
        if (
          spokenWords.has(word)
        ) {
          matches++;
        }
      }
    );

    const score =
      matches /
      aliasWords.length;

    best = Math.max(
      best,
      score
    );
  });

  return best;
}


/*
=========================================================
QUESTION NUMBER EXTRACTION
=========================================================
*/

function getQuestionNumber(
  text = ""
) {
  const match =
    text.match(
      /^\s*(\d{1,3})\s*[\.\):\-]/
    );

  if (!match) {
    return null;
  }

  return Number(
    match[1]
  );
}


/*
=========================================================
CLEAN QUESTION
=========================================================
*/

function cleanQuestion(
  text = ""
) {
  return text
    .replace(
      /^\s*\d{1,3}\s*[\.\):\-]\s*/,
      ""
    )
    .replace(
      /^\s*answer\s*:?\s*/i,
      ""
    )
    .trim();
}


/*
=========================================================
APP
=========================================================
*/

function App() {

  const [file, setFile] =
    useState(null);

  const [pdfUrl, setPdfUrl] =
    useState(null);

  const [numPages, setNumPages] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [listening, setListening] =
    useState(false);

  const [spokenText, setSpokenText] =
    useState("");

  const [
    matchedQuestion,
    setMatchedQuestion,
  ] = useState(null);

  const [topMatches, setTopMatches] =
    useState([]);

  const [matchScore, setMatchScore] =
    useState(0);

  const recognitionRef =
    useRef(null);

  const pageRefs =
    useRef([]);


  /*
  =======================================================
  CLEAN UP PDF URL
  =======================================================
  */

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(
          pdfUrl
        );
      }
    };
  }, [pdfUrl]);


  /*
  =======================================================
  CLEAN UP MICROPHONE
  =======================================================
  */

  useEffect(() => {
    return () => {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    };
  }, []);


  /*
  =======================================================
  FILE UPLOAD
  =======================================================
  */

  const handleFileChange =
    async (event) => {

      const selectedFile =
        event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      if (
        selectedFile.type !==
        "application/pdf"
      ) {
        setError(
          "Please select a PDF file."
        );
        return;
      }

      stopListening();

      setError("");
      setSpokenText("");
      setMatchedQuestion(null);
      setTopMatches([]);
      setMatchScore(0);
      setQuestions([]);
      pageRefs.current = [];

      if (pdfUrl) {
        URL.revokeObjectURL(
          pdfUrl
        );
      }

      const newUrl =
        URL.createObjectURL(
          selectedFile
        );

      setFile(
        selectedFile
      );

      setPdfUrl(
        newUrl
      );

      await extractQuestions(
        selectedFile
      );
    };


  /*
  =======================================================
  EXTRACT QUESTIONS FROM PDF
  =======================================================
  */

  const extractQuestions =
    async (selectedFile) => {

      try {

        setLoading(true);
        setError("");

        const buffer =
          await selectedFile.arrayBuffer();

        const loadingTask =
          pdfjs.getDocument({
            data: buffer,
          });

        const pdf =
          await loadingTask.promise;

        const extracted = [];

        for (
          let pageNumber = 1;
          pageNumber <=
          pdf.numPages;
          pageNumber++
        ) {

          const page =
            await pdf.getPage(
              pageNumber
            );

          const textContent =
            await page.getTextContent();

          const pageText =
            textContent.items
              .map(
                (item) =>
                  item.str || ""
              )
              .join(" ")
              .replace(
                /\s+/g,
                " "
              )
              .trim();

          /*
            Look for numbered questions.

            Example:

            1. Tell me about yourself
            2. Walk me through your resume
          */

          const questionRegex =
            /(?:^|\s)(\d{1,3})\s*[\.\):\-]\s*([^]*?)(?=\s+\d{1,3}\s*[\.\):\-]\s+|$)/g;

          const matches =
            [
              ...pageText.matchAll(
                questionRegex
              ),
            ];

          if (
            matches.length > 0
          ) {

            matches.forEach(
              (match) => {

                const number =
                  Number(
                    match[1]
                  );

                const text =
                  cleanQuestion(
                    match[2]
                  );

                if (
                  number >= 1 &&
                  number <= 500 &&
                  text.length >= 5
                ) {

                  extracted.push({
                    number,
                    text,
                    pageNumber,
                  });

                }

              }
            );

          }

          /*
            If no numbered questions
            were found, keep the page
            as a fallback searchable item.
          */

          if (
            matches.length === 0 &&
            pageText.length > 20
          ) {

            extracted.push({
              number: null,
              text: pageText,
              pageNumber,
            });

          }

        }

        /*
          Remove duplicates.
        */

        const unique =
          extracted.filter(
            (item, index, array) =>
              index ===
              array.findIndex(
                (other) =>
                  other.number ===
                    item.number &&
                  other.pageNumber ===
                    item.pageNumber &&
                  other.text ===
                    item.text
              )
          );

        setQuestions(
          unique
        );

        setNumPages(
          pdf.numPages
        );

        if (
          unique.length === 0
        ) {

          setError(
            "PDF loaded, but I could not identify the questions."
          );

        }

      } catch (err) {

        console.error(
          "PDF extraction error:",
          err
        );

        setError(
          "Unable to read this PDF. Please try another PDF."
        );

      } finally {

        setLoading(false);

      }

    };


  /*
  =======================================================
  PDF LOADED
  =======================================================
  */

  const onDocumentLoadSuccess =
    ({ numPages }) => {

      setNumPages(
        numPages
      );

      pageRefs.current =
        new Array(
          numPages
        );

    };


  /*
  =======================================================
  FIND BEST QUESTION
  =======================================================
  */

  const findBestQuestion =
    (spoken) => {

      if (
        !spoken ||
        questions.length === 0
      ) {
        return;
      }

      const results =
        questions.map(
          (question) => {

            const aliases =
              QUESTION_ALIASES[
                question.number
              ] || [];

            const aliasScore =
              aliasSimilarity(
                spoken,
                aliases
              );

            const wordScore =
              wordSimilarity(
                spoken,
                question.text
              );

            /*
              If an alias exists,
              give it more importance.

              Otherwise use normal
              question-text similarity.
            */

            const finalScore =
              aliasScore > 0
                ? aliasScore *
                    0.8 +
                  wordScore *
                    0.2
                : wordScore;

            return {
              ...question,
              aliasScore,
              wordScore,
              score:
                finalScore,
            };

          }
        );

      results.sort(
        (a, b) =>
          b.score -
          a.score
      );

      const best =
        results[0];

      if (!best) {
        return;
      }

      console.log(
        "Spoken:",
        spoken
      );

      console.log(
        "Best match:",
        best
      );

      setTopMatches(
        results.slice(
          0,
          3
        )
      );

      /*
        Don't require an extremely high
        score because interviewers can
        phrase questions differently.
      */

      if (
        best.score >=
        0.28
      ) {

        setMatchedQuestion(
          best
        );

        setMatchScore(
          Math.round(
            best.score *
              100
          )
        );

        scrollToPage(
          best.pageNumber
        );

      } else {

        setMatchedQuestion(
          null
        );

        setMatchScore(
          0
        );

      }

    };


  /*
  =======================================================
  SCROLL TO PAGE
  =======================================================
  */

  const scrollToPage =
    (pageNumber) => {

      if (!pageNumber) {
        return;
      }

      setTimeout(() => {

        const element =
          pageRefs.current[
            pageNumber - 1
          ];

        if (element) {

          element.scrollIntoView({
            behavior:
              "smooth",
            block:
              "center",
          });

        }

      }, 300);

    };


  /*
  =======================================================
  START MICROPHONE
  =======================================================
  */

  const startListening =
    () => {

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (
        !SpeechRecognition
      ) {

        setError(
          "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
        );

        return;

      }

      if (!file) {

        setError(
          "Please upload your interview PDF first."
        );

        return;

      }

      setError("");
      setSpokenText("");
      setMatchedQuestion(
        null
      );
      setTopMatches([]);
      setMatchScore(0);

      /*
        Stop previous recognition.
      */

      if (
        recognitionRef.current
      ) {

        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }

      }

      const recognition =
        new SpeechRecognition();

      recognition.lang =
        "en-US";

      recognition.continuous =
        false;

      recognition.interimResults =
        false;

      recognition.maxAlternatives =
        5;


      /*
        START
      */

      recognition.onstart =
        () => {
          setListening(true);
        };


      /*
        RESULT
      */

      recognition.onresult =
        (event) => {

          let transcript =
            "";

          for (
            let i =
              event.resultIndex;
            i <
              event.results.length;
            i++
          ) {

            transcript +=
              event.results[
                i
              ][0]
                .transcript;

          }

          transcript =
            transcript.trim();

          if (!transcript) {
            return;
          }

          setSpokenText(
            transcript
          );

          findBestQuestion(
            transcript
          );

        };


      /*
        ERROR
      */

      recognition.onerror =
        (event) => {

          console.error(
            "Speech recognition error:",
            event.error
          );

          setListening(
            false
          );

          switch (
            event.error
          ) {

            case "not-allowed":

              setError(
                "Microphone permission was denied. Please allow microphone access."
              );

              break;

            case "no-speech":

              setError(
                "I didn't hear anything. Please speak again."
              );

              break;

            case "audio-capture":

              setError(
                "No microphone was detected."
              );

              break;

            case "network":

              setError(
                "Speech recognition needs an internet connection in this browser."
              );

              break;

            default:

              setError(
                "Speech recognition could not start. Please try again."
              );

          }

        };


      /*
        END
      */

      recognition.onend =
        () => {

          setListening(
            false
          );

        };


      recognitionRef.current =
        recognition;


      try {

        recognition.start();

      } catch (err) {

        console.error(
          "Microphone start error:",
          err
        );

        setListening(
          false
        );

      }

    };


  /*
  =======================================================
  STOP MICROPHONE
  =======================================================
  */

  const stopListening =
    () => {

      if (
        recognitionRef.current
      ) {

        try {

          recognitionRef.current.stop();

        } catch {
          // Ignore
        }

      }

      setListening(
        false
      );

    };


  /*
  =======================================================
  CLEAR APP
  =======================================================
  */

  const clearAll =
    () => {

      stopListening();

      if (pdfUrl) {

        URL.revokeObjectURL(
          pdfUrl
        );

      }

      setFile(null);
      setPdfUrl(null);
      setNumPages(null);
      setQuestions([]);
      setSpokenText("");
      setMatchedQuestion(
        null
      );
      setTopMatches([]);
      setMatchScore(0);
      setError("");

      pageRefs.current = [];

      const input =
        document.getElementById(
          "pdf-upload"
        );

      if (input) {
        input.value = "";
      }

    };


  /*
  =======================================================
  CHECK MATCHED PAGE
  =======================================================
  */

  const isMatchedPage =
    (pageNumber) => {

      return (
        matchedQuestion &&
        matchedQuestion.pageNumber ===
          pageNumber
      );

    };


  /*
  =======================================================
  UI
  =======================================================
  */

  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f4f6f8",

        padding:
          "25px 15px",

        fontFamily:
          "Arial, Helvetica, sans-serif",

        boxSizing:
          "border-box",
      }}
    >

      <div
        style={{
          maxWidth:
            "1100px",

          margin:
            "0 auto",
        }}
      >

        {/* =========================================
            HEADER
        ========================================= */}

        <div
          style={{
            background:
              "#fff",

            borderRadius:
              "12px",

            padding:
              "24px",

            marginBottom:
              "20px",

            boxShadow:
              "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >

          <h1
            style={{
              textAlign:
                "center",

              margin:
                "0 0 8px",

              fontSize:
                "28px",

              color:
                "#222",
            }}
          >
            PDF Voice Search
          </h1>


          <p
            style={{
              textAlign:
                "center",

              margin:
                "0 0 20px",

              color:
                "#666",
            }}
          >
            Upload your interview PDF
            and speak the question.
          </p>


          {/* FILE */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "center",

              alignItems:
                "center",

              gap:
                "10px",

              flexWrap:
                "wrap",
            }}
          >

            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,application/pdf"
              onChange={
                handleFileChange
              }
            />


            {file && (

              <button
                type="button"
                onClick={
                  clearAll
                }
                style={{
                  padding:
                    "9px 15px",

                  border:
                    "none",

                  borderRadius:
                    "6px",

                  background:
                    "#dc3545",

                  color:
                    "#fff",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600",
                }}
              >
                Clear PDF
              </button>

            )}

          </div>


          {/* FILE NAME */}

          {file && (

            <div
              style={{
                textAlign:
                  "center",

                marginTop:
                  "10px",

                color:
                  "#555",

                fontSize:
                  "14px",

                wordBreak:
                  "break-word",
              }}
            >
              Selected:{" "}
              <strong>
                {file.name}
              </strong>
            </div>

          )}


          {/* MICROPHONE */}

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "center",

              marginTop:
                "18px",
            }}
          >

            {!listening ? (

              <button
                type="button"
                onClick={
                  startListening
                }
                disabled={
                  !file ||
                  loading
                }
                style={{
                  padding:
                    "12px 25px",

                  border:
                    "none",

                  borderRadius:
                    "8px",

                  background:
                    !file ||
                    loading
                      ? "#999"
                      : "#222",

                  color:
                    "#fff",

                  cursor:
                    !file ||
                    loading
                      ? "not-allowed"
                      : "pointer",

                  fontSize:
                    "15px",

                  fontWeight:
                    "bold",
                }}
              >
                🎤 Speak Question
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  stopListening
                }
                style={{
                  padding:
                    "12px 25px",

                  border:
                    "none",

                  borderRadius:
                    "8px",

                  background:
                    "#dc3545",

                  color:
                    "#fff",

                  cursor:
                    "pointer",

                  fontSize:
                    "15px",

                  fontWeight:
                    "bold",
                }}
              >
                ⏹ Stop Listening
              </button>

            )}

          </div>


          {/* LISTENING */}

          {listening && (

            <div
              style={{
                textAlign:
                  "center",

                marginTop:
                  "14px",

                color:
                  "#dc3545",

                fontWeight:
                  "bold",
              }}
            >
              🔴 Listening...

              <div
                style={{
                  marginTop:
                    "5px",

                  fontSize:
                    "13px",

                  color:
                    "#666",

                  fontWeight:
                    "normal",
                }}
              >
                Speak the interviewer's
                question clearly.
              </div>
            </div>

          )}


          {/* SPOKEN TEXT */}

          {spokenText && (

            <div
              style={{
                marginTop:
                  "18px",

                padding:
                  "14px",

                background:
                  "#f1f3f5",

                borderRadius:
                  "8px",

                lineHeight:
                  "1.5",

                wordBreak:
                  "break-word",
              }}
            >

              <strong>
                You said:
              </strong>

              <div
                style={{
                  marginTop:
                    "6px",
                }}
              >
                {spokenText}
              </div>

            </div>

          )}


          {/* MATCH */}

          {matchedQuestion && (

            <div
              style={{
                marginTop:
                  "18px",

                padding:
                  "16px",

                background:
                  "#e8f5e9",

                border:
                  "2px solid #28a745",

                borderRadius:
                  "8px",
              }}
            >

              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap:
                    "10px",

                  flexWrap:
                    "wrap",
                }}
              >

                <strong
                  style={{
                    color:
                      "#1b5e20",

                    fontSize:
                      "17px",
                  }}
                >
                  🎯 Most likely question
                </strong>

                <span
                  style={{
                    fontSize:
                      "13px",

                    color:
                      "#555",
                  }}
                >
                  Match:{" "}
                  {matchScore}%
                </span>

              </div>


              <div
                style={{
                  marginTop:
                    "10px",

                  fontWeight:
                    "600",

                  fontSize:
                    "16px",

                  lineHeight:
                    "1.5",

                  wordBreak:
                    "break-word",
                }}
              >

                {matchedQuestion.number
                  ? `Q${matchedQuestion.number}. `
                  : ""}

                {matchedQuestion.text}

              </div>


              <button
                type="button"
                onClick={() =>
                  scrollToPage(
                    matchedQuestion.pageNumber
                  )
                }
                style={{
                  marginTop:
                    "12px",

                  padding:
                    "8px 14px",

                  border:
                    "none",

                  borderRadius:
                    "6px",

                  background:
                    "#28a745",

                  color:
                    "#fff",

                  cursor:
                    "pointer",
                }}
              >
                Go to question
              </button>

            </div>

          )}


          {/* TOP MATCHES */}

          {topMatches.length >
            1 && (

            <div
              style={{
                marginTop:
                  "15px",
              }}
            >

              <div
                style={{
                  fontWeight:
                    "bold",

                  fontSize:
                    "14px",

                  color:
                    "#555",

                  marginBottom:
                    "8px",
                }}
              >
                Other possible matches:
              </div>


              {topMatches
                .slice(1, 3)
                .map(
                  (
                    match,
                    index
                  ) => (

                    <button
                      key={`${match.number}-${match.pageNumber}-${index}`}
                      type="button"
                      onClick={() =>
                        scrollToPage(
                          match.pageNumber
                        )
                      }
                      style={{
                        display:
                          "block",

                        width:
                          "100%",

                        textAlign:
                          "left",

                        padding:
                          "10px",

                        marginBottom:
                          "7px",

                        border:
                          "1px solid #ddd",

                        borderRadius:
                          "6px",

                        background:
                          "#fff",

                        cursor:
                          "pointer",

                        lineHeight:
                          "1.45",

                        wordBreak:
                          "break-word",
                      }}
                    >

                      {match.number
                        ? `Q${match.number}. `
                        : ""}

                      {match.text}

                    </button>

                  )
                )}

            </div>

          )}


          {/* LOADING */}

          {loading && (

            <div
              style={{
                textAlign:
                  "center",

                marginTop:
                  "15px",

                color:
                  "#666",
              }}
            >
              Reading PDF questions...
            </div>

          )}


          {/* ERROR */}

          {error && (

            <div
              style={{
                marginTop:
                  "15px",

                padding:
                  "12px",

                background:
                  "#fff3cd",

                color:
                  "#856404",

                border:
                  "1px solid #ffeeba",

                borderRadius:
                  "7px",

                lineHeight:
                  "1.5",

                wordBreak:
                  "break-word",
              }}
            >
              {error}
            </div>

          )}

        </div>


        {/* =========================================
            PDF VIEWER
        ========================================= */}

        {pdfUrl && (

          <div
            style={{
              background:
                "#525659",

              borderRadius:
                "12px",

              padding:
                "20px",

              overflowX:
                "auto",

              boxShadow:
                "0 2px 10px rgba(0,0,0,0.12)",
            }}
          >

            <Document
              file={pdfUrl}
              onLoadSuccess={
                onDocumentLoadSuccess
              }
              onLoadError={(
                err
              ) => {

                console.error(
                  "PDF display error:",
                  err
                );

                setError(
                  "The PDF could not be displayed."
                );

              }}
              loading={
                <div
                  style={{
                    color:
                      "#fff",

                    textAlign:
                      "center",

                    padding:
                      "30px",
                  }}
                >
                  Loading PDF...
                </div>
              }
            >

              {Array.from(
                new Array(
                  numPages || 0
                ),
                (_, index) => {

                  const pageNumber =
                    index + 1;

                  const matched =
                    isMatchedPage(
                      pageNumber
                    );

                  return (

                    <div
                      key={
                        `pdf-page-${pageNumber}`
                      }
                      ref={(
                        element
                      ) => {
                        pageRefs.current[
                          index
                        ] = element;
                      }}
                      style={{
                        marginBottom:
                          "25px",

                        display:
                          "flex",

                        justifyContent:
                          "center",

                        padding:
                          matched
                            ? "8px"
                            : "0",

                        borderRadius:
                          "8px",

                        background:
                          matched
                            ? "#28a745"
                            : "transparent",

                        boxShadow:
                          matched
                            ? "0 0 0 4px rgba(40,167,69,0.25)"
                            : "none",

                        transition:
                          "all 0.3s ease",
                      }}
                    >

                      <div
                        style={{
                          position:
                            "relative",

                          background:
                            "#fff",

                          maxWidth:
                            "100%",
                        }}
                      >

                        {matched && (

                          <div
                            style={{
                              position:
                                "absolute",

                              top:
                                "-30px",

                              left:
                                "0",

                              right:
                                "0",

                              background:
                                "#28a745",

                              color:
                                "#fff",

                              textAlign:
                                "center",

                              padding:
                                "5px",

                              borderRadius:
                                "5px 5px 0 0",

                              fontSize:
                                "13px",

                              fontWeight:
                                "bold",

                              zIndex:
                                10,
                            }}
                          >
                            🎯 MATCHED QUESTION
                          </div>

                        )}


                        <Page
                          pageNumber={
                            pageNumber
                          }

                          width={
                            750
                          }

                          renderTextLayer={
                            true
                          }

                          renderAnnotationLayer={
                            true
                          }
                        />

                      </div>

                    </div>

                  );

                }
              )}

            </Document>

          </div>

        )}


        {/* =========================================
            EMPTY STATE
        ========================================= */}

        {!pdfUrl && (

          <div
            style={{
              background:
                "#fff",

              borderRadius:
                "12px",

              padding:
                "50px 20px",

              textAlign:
                "center",

              color:
                "#777",

              boxShadow:
                "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >

            <div
              style={{
                fontSize:
                  "42px",

                marginBottom:
                  "10px",
              }}
            >
              📄
            </div>


            <h3
              style={{
                margin:
                  "0 0 8px",

                color:
                  "#444",
              }}
            >
              Upload your interview PDF
            </h3>


            <p
              style={{
                margin:
                  0,

                lineHeight:
                  "1.5",
              }}
            >
              Then click
              {" "}
              <strong>
                Speak Question
              </strong>
              {" "}
              and the app will find the
              related question.
            </p>

          </div>

        )}

      </div>

    </div>

  );
}

export default App;