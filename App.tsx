
import React, { useEffect, useState, useRef } from 'react';
import ChartComponent from './components/ChartComponent';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { GoogleGenAI, Chat } from "@google/genai";

gsap.registerPlugin(TextPlugin);

// --- AnimatedTitle Component ---
interface AnimatedTitleProps {
  text: string;
  className?: string;
}
const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text, className }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const letters = text.split("").map((char, index) => (
    <span key={index} className="inline-block opacity-0" style={{ whiteSpace: 'pre-wrap' }}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  useEffect(() => {
    if (titleRef.current) {
      const letterElements = titleRef.current.children;
      gsap.fromTo(letterElements,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.05, 
          stagger: 0.04, 
          ease: 'power3.out',
          delay: 0.8 
        }
      );
    }
  }, []); 

  return (
    <h1 ref={titleRef} className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-sky-100 mb-4 ${className || ''}`}>
      {letters}
    </h1>
  );
};


// --- Constants and Helper Functions ---
const brandColors = {
    primary: 'rgba(0, 180, 216, 0.8)',        
    primaryLight: 'rgba(144, 224, 239, 0.8)', 
    primaryDark: 'rgba(0, 119, 182, 0.8)',    
    accent: 'rgba(202, 240, 248, 0.5)',       
    text: '#e2e8f0' 
};
const brandColorsArray = [brandColors.primary, brandColors.primaryDark, brandColors.primaryLight, brandColors.accent];

function wrapLabel(label: string, maxLength: number): string | string[] {
    if (label.length <= maxLength) return label;
    const words = label.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach(word => {
        if ((currentLine + ' ' + word).trim().length > maxLength && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word;
        } else {
            currentLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
        }
    });
    if (currentLine.length > 0) lines.push(currentLine.trim());
    return lines.length > 1 ? lines : lines[0] || label;
}

const customTooltip = (chartDataLabels: (string | string[])[]) => ({
    plugins: {
        tooltip: {
            callbacks: {
                title: function(tooltipItems: any[]) {
                    const item = tooltipItems[0];
                    if (item && typeof item.dataIndex === 'number' && chartDataLabels[item.dataIndex]) {
                        let label = chartDataLabels[item.dataIndex];
                        return Array.isArray(label) ? label.join(' ') : label;
                    }
                    return '';
                }
            },
            backgroundColor: 'rgba(0,0,0,0.7)',
            titleColor: '#fff',
            bodyColor: '#fff',
            bodyFont: { size: 12 }, // Responsive tooltip font
            titleFont: { size: 14 }, // Responsive tooltip title font
        },
        legend: {
            position: 'top' as const,
            labels: {
                color: brandColors.text,
                font: { size: 12 } // Responsive legend font
            }
        }
    }
});

// --- Chart Data Definitions ---
const marketGrowthLabels = ['2022', '2023', '2024', '2025', '2026 (Proj.)', '2027 (Proj.)', '2028 (Proj.)'];
const marketGrowthData = {
    labels: marketGrowthLabels,
    datasets: [{
        label: 'Market Size (in Billion $)',
        data: [5.2, 8.1, 12.5, 19.8, 29.5, 42.1, 60.3],
        backgroundColor: brandColors.accent,
        borderColor: brandColors.primaryDark,
        fill: true,
        tension: 0.3
    }]
};
const marketGrowthOptions = {
    ...customTooltip(marketGrowthLabels),
    scales: {
        y: { ticks: { color: brandColors.text, font: {size: 10} }, grid: { color: 'rgba(226, 232, 240, 0.1)' } },
        x: { ticks: { color: brandColors.text, font: {size: 10} }, grid: { color: 'rgba(226, 232, 240, 0.1)' } }
    }
};

const marketShareLabels = ['Nexus AI', 'CogniSphere', 'SynthWise', 'Other'];
const marketShareData = {
    labels: marketShareLabels,
    datasets: [{
        label: 'Market Share',
        data: [45, 25, 20, 10],
        backgroundColor: [brandColors.primaryDark, brandColors.primary, brandColors.primaryLight, '#4A5568'], 
        borderColor: '#1e293b', 
        borderWidth: 2
    }]
};
const marketShareOptions = customTooltip(marketShareLabels);

const techAdoptionRawLabels = ['Natural Language Processing', 'Predictive Analytics', 'Computer Vision', 'Reinforcement Learning'];
const techAdoptionWrappedLabels = techAdoptionRawLabels.map(label => wrapLabel(label, 16));
const techAdoptionData = {
    labels: techAdoptionWrappedLabels,
    datasets: [{
        label: 'Adoption Rate (%)',
        data: [95, 75, 40, 25],
        backgroundColor: brandColorsArray,
        borderColor: brandColors.primaryDark,
        borderWidth: 1
    }]
};
const techAdoptionOptions = {
    ...customTooltip(techAdoptionRawLabels),
    indexAxis: 'y' as const,
    plugins: {
       ...(customTooltip(techAdoptionRawLabels).plugins),
       legend: { display: false }
    },
    scales: {
        y: { ticks: { color: brandColors.text, font: {size: 10} }, grid: { color: 'rgba(226, 232, 240, 0.1)' } },
        x: { ticks: { color: brandColors.text, font: {size: 10} }, grid: { color: 'rgba(226, 232, 240, 0.1)' } }
    }
};

const demographicsLabels = ['Productivity', 'Entertainment', 'Social Integration', 'Reliability', 'Security'];
const demographicsData = {
    labels: demographicsLabels,
    datasets: [{
        label: '18-24 years',
        data: [6, 8, 9, 5, 7],
        backgroundColor: 'rgba(0, 180, 216, 0.3)',
        borderColor: 'rgba(0, 180, 216, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 180, 216, 1)',
        pointBorderColor: '#fff',
    }, {
        label: '45-54 years',
        data: [9, 4, 3, 8, 9],
        backgroundColor: 'rgba(0, 119, 182, 0.3)',
        borderColor: 'rgba(0, 119, 182, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(0, 119, 182, 1)',
        pointBorderColor: '#fff',
    }]
};
const demographicsOptions = {
    ...customTooltip(demographicsLabels),
    scales: {
        r: {
            angleLines: { color: 'rgba(226, 232, 240, 0.2)' },
            grid: { color: 'rgba(226, 232, 240, 0.2)' },
            pointLabels: { color: brandColors.text, font: {size: 10} }, // Responsive radar point labels
            ticks: { color: brandColors.text, backdropColor: 'rgba(0,0,0,0.5)', showLabelBackdrop: true, font: {size: 9} } // Responsive radar ticks
        }
    }
};

const sectionDetails = [
    { id: 'marketGrowth', title: 'Market Growth' },
    { id: 'marketShare', title: 'Market Share' },
    { id: 'techAdoption', title: 'Tech Adoption' },
    { id: 'swotAnalysis', title: 'SWOT Analysis' },
    { id: 'consumerPreferences', title: 'Consumer Preferences' },
    { id: 'valueChain', title: 'Value Chain' },
    { id: 'mlEcosystem', title: 'ML Ecosystem' },
    { id: 'dataVsAi', title: 'Data Scientists vs. AI Engineers' },
    { id: 'understandingRegression', title: 'Understanding Regression' },
    { id: 'simpleLinearRegression', title: 'Simple Linear Regression' },
    { id: 'multipleLinearRegression', title: 'Multiple Linear Regression' },
    { id: 'polynomialRegression', title: 'Polynomial Regression' },
    { id: 'trainLogisticRegression', title: 'Training Logistic Regression' },
    { id: 'regressionCheatSheet', title: 'Regression Cheat Sheet' },
    { id: 'classificationMethod', title: 'Classification Method' },
    { id: 'binaryVsMulticlass', title: 'Binary vs. Multi-class' },
    { id: 'decisionTreesIntro', title: 'Decision Trees Intro' },
    { id: 'buildingDecisionTrees', title: 'Building Decision Trees' },
    { id: 'selectingFeaturesDecisionTrees', title: 'Decision Tree Features' },
    { id: 'understandingSvm', title: 'Understanding SVM' },
    { id: 'fraudDetectionSvmDt', title: 'Fraud Detection (DT & SVM)' },
    { id: 'svmForFraudDetection', title: 'SVM for Fraud Detection' },
    { id: 'newsletterSignup', title: 'Newsletter' },
    { id: 'gpuGuidePersonal', title: 'NVIDIA GPUs (Personal)' },
    { id: 'gpuGuideEnterprise', title: 'NVIDIA GPUs (Enterprise)' },
    { id: 'privacyPolicy', title: 'Privacy Policy' } // New entry
];

const h2InfoSectionClasses = "text-2xl sm:text-3xl font-semibold text-sky-300 mb-4 sm:mb-6 text-center"; 
const pInfoSectionClasses = "text-slate-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base"; 
const ulInfoSectionClasses = "list-disc list-inside text-slate-300 space-y-1 sm:space-y-2 mb-3 sm:mb-4 pl-2 sm:pl-4 text-sm sm:text-base"; 
const olInfoSectionClasses = "list-decimal list-inside text-slate-300 space-y-1 sm:space-y-2 mb-3 sm:mb-4 pl-2 sm:pl-4 text-sm sm:text-base"; 
const inlineCodeInfoSectionClasses = "font-mono bg-slate-700 px-1 py-0.5 rounded text-xs sm:text-sm text-sky-300"; 
const codeBlockInfoSectionClasses = "bg-black text-slate-200 p-3 sm:p-4 rounded-md my-2 overflow-x-auto text-xs sm:text-sm font-mono border border-slate-700"; 
const h3InfoSectionClasses = "text-xl sm:text-2xl font-semibold text-slate-200 mt-4 sm:mt-6 mb-3 sm:mb-4"; 
const h4InfoSectionClasses = "text-lg sm:text-xl font-medium text-sky-400 mb-2 sm:mb-3"; 
const infoSectionBaseClasses = "info-section bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl mb-8 sm:mb-12";


interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  let baseStyle = 'inline-flex items-center rounded-md border px-2 py-0.5 sm:px-2.5 text-xs font-semibold transition-colors'; // Adjusted padding
  switch (variant) {
    case 'secondary': 
      baseStyle += ' border-transparent bg-green-700 text-green-100 hover:bg-green-700/80';
      break;
    case 'destructive': 
      baseStyle += ' border-transparent bg-red-700 text-red-100 hover:bg-red-700/80';
      break;
    case 'success': 
      baseStyle += ' border-transparent bg-emerald-700 text-emerald-100 hover:bg-emerald-700/80';
      break;
    case 'warning': 
        baseStyle += ' border-transparent bg-orange-600 text-orange-100 hover:bg-orange-600/80';
        break;
    case 'default': 
    default:
      baseStyle += ' border-transparent bg-sky-700 text-sky-100 hover:bg-sky-700/80';
      break;
  }
  return <span className={`${baseStyle} ${className}`}>{children}</span>;
};

interface NavMenuProps {
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="flex flex-wrap justify-center bg-slate-800 p-2 sm:p-3 mb-6 sm:mb-8 rounded-lg shadow-md sticky top-0 z-40 max-w-7xl mx-auto"> {/* z-index lower than chat modal */}
      {sectionDetails.map(section => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          aria-current={activeSection === section.id ? 'page' : undefined}
          className={`
            px-2 py-1 sm:px-3 sm:py-2 mx-0.5 my-0.5 sm:mx-1 sm:my-1 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75
            ${activeSection === section.id
              ? 'bg-sky-600 text-white font-semibold shadow-sm'
              : 'text-slate-300 hover:bg-slate-700 hover:text-sky-400'
            }
          `}
        >
          {section.title}
        </button>
      ))}
    </nav>
  );
};

interface CheatSheetEntryProps {
  title: string;
  items: { label: string; content: string | JSX.Element }[];
  codeSyntax?: string;
  isFirstInGroup?: boolean;
}

const CheatSheetEntry: React.FC<CheatSheetEntryProps> = ({ title, items, codeSyntax, isFirstInGroup }) => (
  <div className={`mb-6 sm:mb-8 p-3 sm:p-4 border border-slate-700 rounded-lg bg-slate-800 shadow-sm ${!isFirstInGroup ? 'mt-4 sm:mt-6 pt-4 sm:pt-6 border-t' : ''}`}>
    <h4 className={h4InfoSectionClasses}>{title}</h4> 
    {items.map((item, index) => {
      const labelContent = item.label;
      let displayLabel: JSX.Element;

      if (title.toLowerCase().includes('swot') || title.toLowerCase().includes('strength') || title.toLowerCase().includes('weakness') || title.toLowerCase().includes('opportunit') || title.toLowerCase().includes('threat')) {
        if (labelContent.toLowerCase().startsWith('s')) {
          displayLabel = <Badge variant="success">{labelContent}</Badge>;
        } else if (labelContent.toLowerCase().startsWith('w')) {
          displayLabel = <Badge variant="destructive">{labelContent}</Badge>;
        } else if (labelContent.toLowerCase().startsWith('o')) {
          displayLabel = <Badge variant="secondary">{labelContent}</Badge>;
        } else if (labelContent.toLowerCase().startsWith('t')) {
          displayLabel = <Badge variant="warning">{labelContent}</Badge>;
        } else {
          displayLabel = <Badge variant="default">{labelContent}</Badge>; 
        }
      }
      else if (labelContent === 'Purpose') {
        displayLabel = <Badge variant="default">{labelContent}</Badge>;
      } else if (labelContent === 'Pros') {
        displayLabel = <Badge variant="success">{labelContent}</Badge>;
      } else if (labelContent === 'Cons') {
        displayLabel = <Badge variant="destructive">{labelContent}</Badge>;
      } else if (labelContent === 'Description') { 
        displayLabel = <Badge variant="default">{labelContent}</Badge>;
      }
       else { 
        displayLabel = <Badge variant="default">{labelContent}</Badge>;
      }

      return (
        <div key={index} className="mb-2 flex items-start">
          <strong className="text-slate-300 mr-2 shrink-0 text-xs sm:text-sm">{displayLabel}:</strong>
          {typeof item.content === 'string' ? (
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">{item.content}</p>
          ) : (
            <div className="text-slate-400 leading-relaxed text-xs sm:text-sm">{item.content}</div>
          )}
        </div>
      );
    })}
    {codeSyntax && (
      <div className="mt-2 sm:mt-3">
        <strong className="text-slate-300 text-xs sm:text-sm">Code Syntax:</strong>
        <pre className={codeBlockInfoSectionClasses}>
          <code>{codeSyntax.trim()}</code>
        </pre>
      </div>
    )}
  </div>
);

interface ChatMessage {
  id: string;
  sender: 'user' | 'model' | 'system';
  text: string;
}

// --- Main App Component ---
const App: React.FC = () => {
  const [activeSection, setActiveSectionInternal] = useState<string>(sectionDetails[0].id);
  const pageHeaderRef = useRef<HTMLElement>(null);
  const subHeaderRef = useRef<HTMLParagraphElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const animatedImageContainerRef = useRef<HTMLElement>(null); 
  const animatedImageRef = useRef<HTMLImageElement>(null); 
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);

  const mainTitleText = "The AI Assistant Revolution";
  const subHeaderText = "Powered by Naga codex: Deep Research Report on Industry Trends & Market Dynamics";
  const headerBackgroundImageUrl = "https://images.unsplash.com/photo-1713345248737-2698000f143d?q=80&w=3258&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; 

  const setActiveSection = React.useCallback((sectionId: string) => {
    setActiveSectionInternal(sectionId);
    // Optional: Add history push state here if desired for browser back/forward
    // history.pushState({ section: sectionId }, '', `#${sectionId}`);
     // Scroll to section smoothly, accounting for sticky nav
     setTimeout(() => {
      const element = document.getElementById(sectionId);
      const navMenu = document.querySelector('nav.sticky');
      const navHeight = navMenu ? navMenu.getBoundingClientRect().height : 0;
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - navHeight - 20, // 20px offset for better spacing
          behavior: 'smooth',
        });
      }
    }, 150); // Delay to allow section to render and GSAP animation to start
  }, []);

  // Initialize Gemini Chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const apiKey = process.env.API_KEY; 
        if (!apiKey) {
          console.warn("API_KEY environment variable not found. Chatbot will be disabled.");
          setChatMessages([{ 
            id: Date.now().toString(), 
            sender: 'system', 
            text: "Chatbot disabled: API Key not configured. Please set the API_KEY environment variable." 
          }]);
          return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = ai.chats.create({
          model: 'gemini-2.5-flash-preview-04-17',
          config: {
            systemInstruction: "You are Naga Codex AI, an assistant for the 'AI Assistant Revolution Report' website. Your sole purpose is to answer questions strictly related to the AI topics and content presented on this website. This includes AI Industry Trends, Market Research, Machine Learning concepts (like Regression, Classification, SVM, Decision Trees), the AI ecosystem, and other topics covered in the report. Do not answer questions outside of these specific AI-related areas. If a question is unrelated, politely state: 'I am Naga Codex AI, and I can only assist with AI questions related to the content of this website.'",
          }
        });
        setChatInstance(model);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setChatMessages([{ 
          id: Date.now().toString(), 
          sender: 'system', 
          text: "Error initializing chatbot. Please try again later." 
        }]);
      }
    };
    initializeChat();
  }, []);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);


  const toggleChat = () => {
    setIsChatOpen(prev => {
      const newChatOpenState = !prev;
      if (newChatOpenState && chatMessages.length === 0 && chatInstance) { 
        setChatMessages([{ 
          id: Date.now().toString(), 
          sender: 'model', 
          text: "Hello! I am Naga Codex AI. I'm here to help you with questions about the AI topics on this site. How can I assist you today?" 
        }]);
      } else if (newChatOpenState && chatMessages.length === 0 && !chatInstance && !process.env.API_KEY) {
         setChatMessages([{ 
            id: Date.now().toString(), 
            sender: 'system', 
            text: "Chatbot disabled: API Key not configured. Please set the API_KEY environment variable." 
          }]);
      }
      return newChatOpenState;
    });
  };
  
  const handleChatInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !chatInstance || isChatLoading) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput.trim() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await chatInstance.sendMessage({ message: newUserMessage.text });
      const botResponseText = response.text;
      const newBotMessage: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'model', text: botResponseText };
      setChatMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'system', 
        text: "Sorry, I encountered an error trying to respond. Please try again." 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };


  useEffect(() => {
    if (window.Chart) {
      window.Chart.defaults.font.family = "'Quicksand', sans-serif";
      window.Chart.defaults.color = brandColors.text;
    }
    
    if (pageHeaderRef.current) {
        gsap.fromTo(pageHeaderRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 } 
        );
    }
    
    if (subHeaderRef.current) {
      const subFullText = subHeaderText;
      subHeaderRef.current.textContent = ""; 
      gsap.to(subHeaderRef.current, {
        duration: subFullText.length * 0.06, 
        text: { value: subFullText, newClass:"cursor-blink" },
        ease: "none",
        delay: 1.8 
      });
    }
  }, [subHeaderText]); 

  useEffect(() => {
    const container = animatedImageContainerRef.current;
    const image = animatedImageRef.current;

    if (container && image) {
      const onMouseEnter = () => {
        gsap.to(image, { scale: 1.05, duration: 0.4, ease: 'power2.out' });
      };
      const onMouseLeave = () => {
        gsap.to(image, { scale: 1, duration: 0.4, ease: 'power2.out' });
      };

      container.addEventListener('mouseenter', onMouseEnter);
      container.addEventListener('mouseleave', onMouseLeave);

      return () => {
        container.removeEventListener('mouseenter', onMouseEnter);
        container.removeEventListener('mouseleave', onMouseLeave);
      };
    }
  }, []);


  useEffect(() => {
    if (mainContentRef.current) {
      const activeSectionElement = mainContentRef.current.querySelector<HTMLElement>(`.main-section-content`);
      if (activeSectionElement) {
        // Ensure the new content is rendered before animating
        gsap.set(activeSectionElement, { opacity: 0, y: 20 }); 
        gsap.to(activeSectionElement,
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );
      }
    }
  }, [activeSection]);


  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <header
        ref={pageHeaderRef}
        className="bg-slate-900 py-12 sm:py-16 md:py-20 text-center shadow-xl opacity-0" 
      >
        <div className="container mx-auto px-4">
          <AnimatedTitle text={mainTitleText} /> 
          <p ref={subHeaderRef} className="text-md sm:text-lg md:text-xl text-sky-200 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto opacity-1">
            {/* Text will be animated by GSAP TextPlugin */}
          </p>
        </div>
      </header>

      <section ref={animatedImageContainerRef} className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden my-6 sm:my-8 shadow-2xl">
        <img 
            ref={animatedImageRef} 
            src={headerBackgroundImageUrl} 
            alt="AI Technology Abstract" 
            className="w-full h-full object-cover" 
        />
      </section>

      <NavMenu activeSection={activeSection} setActiveSection={setActiveSection} />

      <main ref={mainContentRef} className="container mx-auto p-3 sm:p-4 md:p-8 max-w-7xl flex-grow"> 
        <div className="main-section-content"> 
            {activeSection === 'marketGrowth' && (
            <section id="marketGrowth" className={`chart-section ${infoSectionBaseClasses}`}>
                <h2 className={`${h2InfoSectionClasses} flex items-center justify-center`}>Market Growth Projection <Badge className="ml-2 sm:ml-3">Trending</Badge></h2>
                <ChartComponent
                chartId="marketGrowthChart"
                type="line"
                data={marketGrowthData}
                options={marketGrowthOptions}
                className="h-64 sm:h-72 md:h-96"
                />
            </section>
            )}
            {activeSection === 'marketShare' && (
            <section id="marketShare" className={`chart-section ${infoSectionBaseClasses}`}>
                <h2 className={h2InfoSectionClasses}>Current Market Share</h2>
                <ChartComponent
                chartId="marketShareChart"
                type="doughnut"
                data={marketShareData}
                options={marketShareOptions}
                className="h-64 sm:h-72 md:h-96"
                />
            </section>
            )}
            {activeSection === 'techAdoption' && (
            <section id="techAdoption" className={`chart-section ${infoSectionBaseClasses}`}>
                <h2 className={h2InfoSectionClasses}>Key Technology Adoption Rates</h2>
                <ChartComponent
                chartId="techAdoptionChart"
                type="bar"
                data={techAdoptionData}
                options={techAdoptionOptions}
                className="h-64 sm:h-72 md:h-96"
                />
            </section>
            )}
             {activeSection === 'consumerPreferences' && (
            <section id="consumerPreferences" className={`chart-section ${infoSectionBaseClasses}`}>
                <h2 className={h2InfoSectionClasses}>Consumer Preferences by Age Group</h2>
                <ChartComponent
                chartId="demographicsChart"
                type="radar"
                data={demographicsData}
                options={demographicsOptions}
                className="h-72 sm:h-80 md:h-[450px] lg:h-[500px]" // Adjusted radar height
                />
            </section>
            )}
            {activeSection === 'swotAnalysis' && (
            <section id="swotAnalysis" className={infoSectionBaseClasses}>
                <h2 className={h2InfoSectionClasses}>SWOT Analysis: AI Assistant Market</h2>
                <p className={pInfoSectionClasses}>A strategic overview of the market's internal strengths and weaknesses, alongside external opportunities and threats, reveals a dynamic and rapidly evolving sector. Navigating these factors will be critical for both established players and new entrants.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <CheatSheetEntry 
                        title="Strengths"
                        items={[
                            { label: 'S1 - High Demand', content: 'High demand for automation and personalization.' },
                            { label: 'S2 - Tech Advancements', content: 'Rapid technological advancements in AI/ML.' },
                            { label: 'S3 - Scalable Models', content: 'Scalable business models (SaaS).' },
                            { label: 'S4 - IoT Integration', content: 'Strong integration with IoT devices.' }
                        ]} 
                        isFirstInGroup={true} 
                    />
                     <CheatSheetEntry 
                        title="Weaknesses"
                        items={[
                            { label: 'W1 - High Costs', content: 'High development and R&D costs.'},
                            { label: 'W2 - Privacy Concerns', content: 'Concerns over data privacy and security.'},
                            { label: 'W3 - Data Dependence', content: 'Dependence on large, high-quality datasets.'},
                            { label: 'W4 - Algorithmic Bias', content: 'Risk of algorithmic bias.'}
                        ]}
                    />
                    <CheatSheetEntry 
                        title="Opportunities"
                        items={[
                            { label: 'O1 - Enterprise Expansion', content: 'Expansion into specialized enterprise markets.'},
                            { label: 'O2 - Emerging Tech', content: 'Integration with emerging tech (AR/VR).'},
                            { label: 'O3 - Hyper-Personalization', content: 'Hyper-personalization for new verticals (healthcare, finance).'},
                            { label: 'O4 - Partnerships', content: 'Partnerships with hardware manufacturers.'}
                        ]}
                    />
                     <CheatSheetEntry 
                        title="Threats"
                        items={[
                            { label: 'T1 - Intense Competition', content: 'Intensifying competition from tech giants.'},
                            { label: 'T2 - Evolving Regulations', content: 'Evolving data protection regulations (e.g., GDPR).'},
                            { label: 'T3 - Public Distrust', content: 'Public distrust of AI and data collection.'},
                            { label: 'T4 - Disruptive Tech', content: 'Potential for disruptive new technologies.'}
                        ]}
                    />
                </div>
            </section>
            )}
            {activeSection === 'valueChain' && (
            <section id="valueChain" className={infoSectionBaseClasses}>
                <h2 className={h2InfoSectionClasses}>Value Chain Process Flow</h2>
                <p className={`${pInfoSectionClasses} text-center`}>
                    The value chain for AI assistants involves several key stages, from foundational data acquisition to final user interaction. Each step adds a layer of value, with AI model training and user feedback loops being the most critical for continuous improvement and competitive advantage.
                </p>
                <div className="flex flex-col space-y-3 sm:space-y-4 max-w-md sm:max-w-lg md:max-w-2xl mx-auto mt-6 sm:mt-8">
                    {[
                        { num: 1, title: 'Data Acquisition & Processing', desc: 'Collecting and cleaning massive datasets for training.', color: 'bg-sky-500' },
                        { num: 2, title: 'AI Model Training & Tuning', desc: 'Developing and refining core NLP/ML models.', color: 'bg-sky-600' },
                        { num: 3, title: 'Platform & API Development', desc: 'Building the user-facing app and integrations.', color: 'bg-sky-700' },
                        { num: 4, title: 'User Interaction & Feedback Loop', desc: 'Delivering service and collecting data for re-training.', color: 'bg-sky-800' }
                    ].map((item, index, arr) => (
                        <React.Fragment key={item.num}>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`${item.color} text-slate-900 rounded-full h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center font-bold text-lg sm:text-xl shadow-md shrink-0`}>{item.num}</div>
                                <div className="bg-slate-700 p-3 sm:p-4 rounded-lg flex-1 border border-slate-600 shadow-sm">
                                    <h3 className="font-semibold text-sky-400 text-md sm:text-lg">{item.title}</h3>
                                    <p className="text-xs sm:text-sm text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                            {index < arr.length - 1 && <div className="text-center text-xl sm:text-2xl text-slate-500 animate-pulse">▼</div>}
                        </React.Fragment>
                    ))}
                </div>
            </section>
            )}
            {activeSection === 'mlEcosystem' && (
                <section id="mlEcosystem" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Machine Learning Ecosystem</h2>
                    <p className={pInfoSectionClasses}>
                        The machine learning ecosystem consists of interconnected tools, frameworks, libraries, platforms, and processes for developing and managing machine learning models. Python offers various libraries like NumPy, Pandas, SciPy, and Matplotlib, which are essential for machine learning tasks.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Scikit-Learn Library</h3>
                    <p className={pInfoSectionClasses}>
                        Scikit-learn is a free Python library that includes algorithms for classification, regression, clustering, and dimensionality reduction. It simplifies the machine learning workflow with built-in functions for data preprocessing, model training, evaluation, and deployment.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Basic Machine Learning Workflow</h3>
                    <p className={pInfoSectionClasses}>
                        The workflow involves data preparation, splitting datasets into training and testing sets, model instantiation, training, and evaluation using metrics like confusion matrices. Scikit-learn allows for easy implementation of these tasks with minimal code, making it accessible for practitioners.
                    </p>
                </section>
            )}
            {activeSection === 'dataVsAi' && (
                <section id="dataVsAi" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Data Scientists vs. AI Engineers in Generative AI</h2>
                    <p className={pInfoSectionClasses}>
                        The content discusses the differences between data scientists and AI engineers, particularly in the context of generative AI.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Differences in Use Cases</h3>
                    <p className={pInfoSectionClasses}>
                        Data scientists act as data storytellers, using descriptive analytics to analyze past data and make predictions through machine learning models. AI engineers focus on building generative AI systems, utilizing prescriptive use cases to determine optimal actions and create intelligent assistants.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Differences in Data Types</h3>
                    <p className={pInfoSectionClasses}>
                        Data scientists primarily work with structured data, requiring extensive cleaning and preprocessing before modeling. AI engineers mainly handle unstructured data, such as text and images, and utilize large-scale foundation models for training.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Differences in Models and Processes</h3>
                    <p className={pInfoSectionClasses}>
                        Data scientists use a variety of models tailored to specific tasks, which are generally smaller and require less computational power. AI engineers rely on foundation models that can generalize across tasks, requiring significant computational resources and longer training times.
                    </p>
                    <p className={pInfoSectionClasses}>
                        Overall, the advancements in generative AI have led to distinct roles and processes for data scientists and AI engineers, while both fields continue to evolve rapidly.
                    </p>
                </section>
            )}
            {activeSection === 'understandingRegression' && (
                <section id="understandingRegression" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Understanding Regression</h2>
                    <p className={pInfoSectionClasses}>
                        Regression is a supervised learning model that establishes a relationship between a continuous target variable and explanatory features. It can predict continuous values, such as CO2 emissions from car features like engine size and fuel consumption.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Types of Regression</h3>
                    <p className={pInfoSectionClasses}>
                        Simple regression involves a single independent variable predicting a dependent variable, which can be linear or nonlinear. Multiple regression uses more than one independent variable, maintaining the distinctions of linear and nonlinear relationships.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Applications of Regression</h3>
                    <p className={pInfoSectionClasses}>
                        Regression is used in various fields, including sales forecasting, predicting maintenance needs, estimating rainfall, and public health predictions. It can also assess the likelihood of developing diseases based on patient data and other factors.
                    </p>
                </section>
            )}
            {activeSection === 'simpleLinearRegression' && (
                <section id="simpleLinearRegression" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Understanding Simple Linear Regression</h2>
                    <p className={pInfoSectionClasses}>
                        Simple linear regression models a linear relationship between one independent variable and a dependent variable, such as predicting CO2 emissions based on engine size. A scatter plot can illustrate the correlation between the independent variable (engine size) and the dependent variable (CO2 emissions), showing a linear trend.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Key Concepts in Linear Regression</h3>
                    <p className={pInfoSectionClasses}>
                        The model is represented by the equation of a line, where the predicted response (<code className={inlineCodeInfoSectionClasses}>ŷ</code>) is calculated using coefficients (<code className={inlineCodeInfoSectionClasses}>θ₀</code> and <code className={inlineCodeInfoSectionClasses}>θ₁</code>) determined by the regression algorithm. The residual error measures the difference between actual and predicted values, and the mean squared error (MSE) quantifies how well the regression line fits the data.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Ordinary Least Squares (OLS) Regression</h3>
                    <p className={pInfoSectionClasses}>
                        OLS regression aims to minimize the mean of all residual errors and is calculated using specific formulas derived by mathematicians in the early 1800s. While OLS regression is easy to understand and fast for smaller datasets, it may not capture complex relationships and can be affected by outliers.
                    </p>
                </section>
            )}
            {activeSection === 'multipleLinearRegression' && (
                <section id="multipleLinearRegression" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Multiple Linear Regression</h2>
                    <p className={pInfoSectionClasses}>
                        Multiple linear regression is a statistical technique used to model the relationship between one dependent variable and two or more independent variables. It extends simple linear regression, which only considers one independent variable.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Key Features</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>
                            <strong>Model Structure:</strong> The model can be expressed mathematically as:
                            <div className={`${pInfoSectionClasses} font-mono text-center my-2 p-2 bg-slate-700 rounded text-sm sm:text-base`}>
                                ŷ = θ<sub>0</sub> + θ<sub>1</sub>x<sub>1</sub> + θ<sub>2</sub>x<sub>2</sub> + ... + θ<sub>n</sub>x<sub>n</sub>
                            </div>
                            Where:
                            <ul className="list-disc list-inside ml-4 text-slate-400 space-y-1 text-xs sm:text-sm">
                                <li><code className={inlineCodeInfoSectionClasses}>ŷ</code> is the predicted value of the dependent variable.</li>
                                <li><code className={inlineCodeInfoSectionClasses}>θ₀</code> is the intercept.</li>
                                <li><code className={inlineCodeInfoSectionClasses}>θ₁, θ₂, ..., θ<sub className="text-xs">n</sub></code> are the coefficients for each independent variable (<code className={inlineCodeInfoSectionClasses}>x₁, x₂, ..., x<sub className="text-xs">n</sub></code>).</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Purpose:</strong> It helps in predicting the value of the dependent variable based on the values of the independent variables. For example, predicting CO2 emissions based on engine size, number of cylinders, and fuel consumption.
                        </li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Applications</h3>
                    <p className={pInfoSectionClasses}>Used in various fields, including economics, biology, and social sciences, to understand relationships and make predictions. Here are two detailed examples:</p>
                    <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h4 className={h4InfoSectionClasses}>1. Predicting Housing Prices</h4>
                            <p className="text-slate-400 text-xs sm:text-sm mb-2"><strong>Context:</strong> Real estate agents and buyers want to estimate the price of a house based on various features.</p>
                            <p className="text-slate-400 text-xs sm:text-sm mb-1"><strong>Independent Variables:</strong> Square footage, number of bedrooms, number of bathrooms, location, age of the property.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> By using multiple linear regression, one can create a model that predicts the price of a house. This helps buyers make informed decisions and assists agents in pricing properties competitively.</p>
                        </div>
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h4 className={h4InfoSectionClasses}>2. Assessing Student Performance</h4>
                            <p className="text-slate-400 text-xs sm:text-sm mb-2"><strong>Context:</strong> Educators want to understand factors affecting student exam scores.</p>
                            <p className="text-slate-400 text-xs sm:text-sm mb-1"><strong>Independent Variables:</strong> Hours spent studying, attendance rate, test anxiety levels, participation in extracurricular activities.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> A multiple linear regression model can analyze how these factors contribute to students' exam performance. This insight can help educators develop strategies to improve student outcomes.</p>
                        </div>
                    </div>
                    <h3 className={h3InfoSectionClasses}>Consequences of Too Many Variables</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Overfitting:</strong> The model may fit the training data very well but perform poorly on unseen data.</li>
                        <li><strong>Increased Complexity:</strong> More variables can make the model more complex and harder to interpret.</li>
                        <li><strong>Multicollinearity:</strong> If independent variables are highly correlated, it can lead to unreliable coefficient estimates.</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Solutions</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Variable Selection:</strong> Use techniques like backward elimination, forward selection, or regularization (Lasso, Ridge).</li>
                        <li><strong>Cross-Validation:</strong> Assess model performance on different subsets of data.</li>
                        <li><strong>Domain Knowledge:</strong> Leverage expertise to select relevant variables.</li>
                    </ul>
                </section>
            )}
            {activeSection === 'polynomialRegression' && (
                <section id="polynomialRegression" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Polynomial Regression</h2>
                    <p className={pInfoSectionClasses}>
                        Polynomial regression is a type of regression analysis used to model the relationship between a dependent variable and one or more independent variables by fitting a polynomial equation to the data.
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li>
                            <strong>Definition:</strong> It expresses the dependent variable (<code className={inlineCodeInfoSectionClasses}>y</code>) as a polynomial function of the independent variable (<code className={inlineCodeInfoSectionClasses}>x</code>). The general form is:
                            <div className={`${pInfoSectionClasses} font-mono text-center my-2 p-2 bg-slate-700 rounded text-sm sm:text-base`}>
                                y = θ<sub>0</sub> + θ<sub>1</sub>x + θ<sub>2</sub>x<sup>2</sup> + θ<sub>3</sub>x<sup>3</sup> + … + θ<sub>n</sub>x<sup>n</sup>
                            </div>
                            Where <code className={inlineCodeInfoSectionClasses}>θ</code> represents the coefficients.
                        </li>
                        <li><strong>Purpose:</strong> Used when the relationship between variables is nonlinear.</li>
                        <li><strong>Degree of Polynomial:</strong> Determines the curve's shape. Higher degrees risk overfitting.</li>
                        <li><strong>Linearization:</strong> Solvable via linear regression by transforming input variables into polynomial terms.</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Applications</h3>
                     <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h4 className={h4InfoSectionClasses}>1. Economic Forecasting</h4>
                            <p className="text-slate-400 text-xs sm:text-sm mb-2"><strong>Scenario:</strong> Predicting a country's GDP growth over time.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> Economic data often shows nonlinear trends. Polynomial regression can model GDP growth as a polynomial function of time, capturing, for instance, accelerating growth rates.</p>
                        </div>
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h4 className={h4InfoSectionClasses}>2. Environmental Studies</h4>
                            <p className="text-slate-400 text-xs sm:text-sm mb-2"><strong>Scenario:</strong> Analyzing the relationship between temperature and plant growth.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> Plant growth might accelerate up to an optimal temperature and then decline. Polynomial regression can model this nonlinear relationship, aiding agriculture and conservation.</p>
                        </div>
                    </div>
                    <h3 className={h3InfoSectionClasses}>Determining the Appropriate Degree</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Visual Inspection:</strong> Plot data points; if a curve is apparent, try different polynomial degrees.</li>
                        <li><strong>Model Comparison:</strong> Fit models of varying degrees and compare metrics (R-squared, Adjusted R-squared, RMSE).</li>
                        <li><strong>Cross-Validation:</strong> Use K-Fold cross-validation to prevent overfitting and ensure generalization.</li>
                        <li><strong>Overfitting Check:</strong> Monitor performance on training vs. validation sets. A significant drop in validation performance for higher degrees indicates overfitting.</li>
                        <li><strong>Statistical Tests:</strong> Use F-tests to compare if increased complexity significantly improves explanatory power.</li>
                    </ul>
                </section>
            )}
            {activeSection === 'trainLogisticRegression' && (
                <section id="trainLogisticRegression" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Training a Logistic Regression Model</h2>
                    <h3 className={h3InfoSectionClasses}>Training Process Overview</h3>
                    <p className={pInfoSectionClasses}>
                        The goal is to find parameters (<code className={inlineCodeInfoSectionClasses}>θ</code>) that map input features to target outcomes, minimizing prediction error. The process involves choosing initial parameters, predicting probabilities, measuring error with a cost function, and iterating until a satisfactory log loss is achieved.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Log Loss and Optimization</h3>
                    <p className={pInfoSectionClasses}>
                        Log loss is the cost function used to evaluate model performance, favoring confident correct predictions and penalizing confident incorrect ones. The optimization step aims to minimize log loss, which measures how well predicted probabilities match actual classes.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Gradient Descent and Stochastic Gradient Descent</h3>
                    <p className={pInfoSectionClasses}>
                        Gradient descent is an iterative method that adjusts parameters in the direction of the steepest descent to minimize the cost function. Stochastic gradient descent (SGD) is a faster variation that uses a random subset of data, improving convergence but potentially sacrificing accuracy.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Applying Gradient Descent in Practice</h3>
                    <ol className={olInfoSectionClasses}>
                        <li><strong>Initialize Parameters:</strong> Start with random values for <code className={inlineCodeInfoSectionClasses}>θ</code>.</li>
                        <li><strong>Choose a Learning Rate:</strong> Set <code className={inlineCodeInfoSectionClasses}>α</code> (e.g., 0.01) to determine step size.</li>
                        <li><strong>Compute Predictions:</strong> Use current parameters to make predictions.</li>
                        <li><strong>Calculate the Cost Function:</strong> Compute log loss to measure error.</li>
                        <li><strong>Compute the Gradient:</strong> Calculate the derivative of the cost function with respect to each parameter.</li>
                        <li>
                            <strong>Update Parameters:</strong> Adjust using the formula:
                            <div className={`${pInfoSectionClasses} font-mono text-center my-2 p-2 bg-slate-700 rounded text-sm sm:text-base`}>
                                θ = θ - α · ∇J(θ)
                            </div>
                            Where <code className={inlineCodeInfoSectionClasses}>∇J(θ)</code> is the gradient of the cost function.
                        </li>
                        <li><strong>Repeat:</strong> Continue until convergence or a specified number of iterations.</li>
                        <li><strong>Evaluate the Model:</strong> Assess performance on a validation dataset.</li>
                    </ol>
                </section>
            )}
            {activeSection === 'regressionCheatSheet' && (
                <section id="regressionCheatSheet" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Cheat Sheet: Linear and Logistic Regression</h2>
                    <h3 className={h3InfoSectionClasses}>Comparing Different Regression Types</h3>
                    <CheatSheetEntry
                        title="Simple Linear Regression"
                        items={[
                            { label: 'Purpose', content: 'To predict a dependent variable based on one independent variable.' },
                            { label: 'Pros', content: 'Easy to implement, interpret, and efficient for small datasets.' },
                            { label: 'Cons', content: 'Not suitable for complex relationships; prone to underfitting.' },
                            { label: 'Modeling Equation', content: <code className={inlineCodeInfoSectionClasses}>y = b₀ + b₁x</code> }
                        ]}
                        codeSyntax={`from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X, y)`}
                        isFirstInGroup={true}
                    />
                    <CheatSheetEntry
                        title="Polynomial Regression"
                        items={[
                            { label: 'Purpose', content: 'To capture nonlinear relationships between variables.' },
                            { label: 'Pros', content: 'Better at fitting nonlinear data compared to linear regression.' },
                            { label: 'Cons', content: 'Prone to overfitting with high-degree polynomials.' },
                            { label: 'Modeling Equation', content: <code className={inlineCodeInfoSectionClasses}>y = b₀ + b₁x + b₂x² + ...</code> }
                        ]}
                        codeSyntax={`from sklearn.preprocessing import PolynomialFeatures\nfrom sklearn.linear_model import LinearRegression\npoly = PolynomialFeatures(degree=2)\nX_poly = poly.fit_transform(X)\nmodel = LinearRegression().fit(X_poly, y)`}
                    />
                    <CheatSheetEntry
                        title="Multiple Linear Regression"
                        items={[
                            { label: 'Purpose', content: 'To predict a dependent variable based on multiple independent variables.' },
                            { label: 'Pros', content: 'Accounts for multiple factors influencing the outcome.' },
                            { label: 'Cons', content: 'Assumes a linear relationship between predictors and target.' },
                            { label: 'Modeling Equation', content: <code className={inlineCodeInfoSectionClasses}>y = b₀ + b₁x₁ + b₂x₂ + ...</code> }
                        ]}
                        codeSyntax={`from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X, y)`}
                    />
                    <CheatSheetEntry
                        title="Logistic Regression"
                        items={[
                            { label: 'Purpose', content: 'To predict probabilities of categorical outcomes.' },
                            { label: 'Pros', content: 'Efficient for binary classification problems.' },
                            { label: 'Cons', content: 'Assumes a linear relationship between independent variables and log-odds.' },
                            { label: 'Modeling Equation', content: <code className={inlineCodeInfoSectionClasses}>log(p/(1-p)) = b₀ + b₁x₁ + ...</code> }
                        ]}
                        codeSyntax={`from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression()\nmodel.fit(X, y)`}
                    />

                    <h3 className={h3InfoSectionClasses}>Associated Functions Commonly Used</h3>
                     <CheatSheetEntry
                        title="train_test_split"
                        items={[{label: "Description", content: "Splits the dataset into training and testing subsets to evaluate the model's performance."}]}
                        codeSyntax={`from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)`}
                        isFirstInGroup={true}
                    />
                    <CheatSheetEntry
                        title="StandardScaler"
                        items={[{label: "Description", content: "Standardizes features by removing the mean and scaling to unit variance."}]}
                        codeSyntax={`from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)`}
                    />
                    <CheatSheetEntry
                        title="log_loss"
                        items={[{label: "Description", content: "Calculates the logarithmic loss, a performance metric for classification models."}]}
                        codeSyntax={`from sklearn.metrics import log_loss\nloss = log_loss(y_true, y_pred_proba)`}
                    />
                    <CheatSheetEntry
                        title="mean_absolute_error"
                        items={[{label: "Description", content: "Calculates the mean absolute error between actual and predicted values."}]}
                        codeSyntax={`from sklearn.metrics import mean_absolute_error\nmae = mean_absolute_error(y_true, y_pred)`}
                    />
                    <CheatSheetEntry
                        title="mean_squared_error"
                        items={[{label: "Description", content: "Computes the mean squared error between actual and predicted values."}]}
                        codeSyntax={`from sklearn.metrics import mean_squared_error\nmse = mean_squared_error(y_true, y_pred)`}
                    />
                    <CheatSheetEntry
                        title="root_mean_squared_error"
                        items={[{label: "Description", content: "Calculates the root mean squared error (RMSE), a commonly used metric for regression tasks."}]}
                        codeSyntax={`from sklearn.metrics import mean_squared_error\nimport numpy as np\nrmse = np.sqrt(mean_squared_error(y_true, y_pred))`}
                    />
                    <CheatSheetEntry
                        title="r2_score"
                        items={[{label: "Description", content: "Computes the R-squared value, indicating how well the model explains the variability of the target variable."}]}
                        codeSyntax={`from sklearn.metrics import r2_score\nr2 = r2_score(y_true, y_pred)`}
                    />
                    <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-700">
                        <h4 className={h4InfoSectionClasses}>Author(s)</h4>
                        <p className={pInfoSectionClasses}>Jeff Grossman, Abhishek Gagneja</p>
                    </div>
                </section>
            )}
            {activeSection === 'classificationMethod' && (
                <section id="classificationMethod" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Classification Method in Supervised Learning</h2>
                    <p className={pInfoSectionClasses}>
                        The classification method in supervised learning is a technique used to predict categorical labels for new data based on a trained model.
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Supervised Learning:</strong> Involves training a model on a labeled dataset, where the input data is paired with the correct output labels.</li>
                        <li><strong>Categorical Variables:</strong> Classification deals with discrete values, meaning the output labels fall into distinct categories (e.g., "spam" or "not spam").</li>
                        <li><strong>Model Training:</strong> The model learns from the training data by adjusting its parameters to minimize prediction errors. Once trained, it can classify new, unseen data.</li>
                        <li><strong>Applications:</strong> Common uses include email filtering, customer segmentation, and predicting outcomes like loan defaults.</li>
                    </ul>
                    <p className={pInfoSectionClasses}>
                        This method is essential for tasks where the goal is to assign a category to an input based on learned patterns from the training data.
                    </p>
                </section>
            )}
            {activeSection === 'binaryVsMulticlass' && (
                <section id="binaryVsMulticlass" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Binary vs. Multi-class Classification</h2>
                    <p className={pInfoSectionClasses}>
                        The difference between binary and multi-class classification lies in the number of classes or categories that the model predicts.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-2">Binary Classification</h3>
                            <ul className="list-disc list-inside text-slate-400 space-y-1 text-xs sm:text-sm">
                                <li><strong>Definition:</strong> Involves predicting one of two possible classes or labels.</li>
                                <li><strong>Example:</strong> Classifying emails as either "spam" or "not spam."</li>
                                <li><strong>Modeling:</strong> Typically uses binary classifiers, which output a single label based on the input data.</li>
                                <li><strong>Key Points:</strong>
                                    <ul className="list-disc list-inside ml-2 sm:ml-4 mt-1">
                                        <li>The output is limited to two distinct categories.</li>
                                        <li>The model is trained on a labeled dataset where each input is associated with one of the two classes.</li>
                                        <li>The model learns to create a decision boundary that separates the two classes.</li>
                                        <li>Common applications: fraud detection, disease diagnosis, sentiment analysis.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-2">Multi-Class Classification</h3>
                            <ul className="list-disc list-inside text-slate-400 space-y-1 text-xs sm:text-sm">
                                <li><strong>Definition:</strong> Involves predicting one class from three or more possible classes.</li>
                                <li><strong>Example:</strong> Classifying types of fruits as "apple," "banana," or "orange."</li>
                                <li><strong>Modeling:</strong> Can use strategies like one-versus-all (where multiple binary classifiers are trained) or one-versus-one (where classifiers are trained for every pair of classes).</li>
                            </ul>
                        </div>
                    </div>
                    <p className={`${pInfoSectionClasses} mt-3 sm:mt-4`}>
                        In summary, binary classification deals with two classes, while multi-class classification handles multiple classes. Binary classification, in essence, focuses on distinguishing between two categories based on input features.
                    </p>
                </section>
            )}
            {activeSection === 'decisionTreesIntro' && (
                <section id="decisionTreesIntro" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Understanding Decision Trees</h2>
                    <p className={pInfoSectionClasses}>
                        A Decision Tree is a flowchart-like algorithm used for classifying data points, where internal nodes represent tests, branches represent outcomes, and leaf nodes assign classes. The tree is built by analyzing dataset features, such as age, gender, and medical history, to predict outcomes like medication response.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Building and Training Decision Trees</h3>
                    <p className={pInfoSectionClasses}>
                        The training process involves selecting the best feature to split the data at each node based on a splitting criterion, such as information gain or Gini impurity. The tree grows until it meets a stopping criterion, which can include maximum depth or minimum samples in a node.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Pruning Decision Trees</h3>
                    <p className={pInfoSectionClasses}>
                        Pruning is the process of simplifying a Decision Tree to avoid overfitting and improve generalization, resulting in better predictive accuracy. It involves cutting branches that do not significantly enhance performance, leading to a more interpretable and concise model.
                    </p>
                </section>
            )}
            {activeSection === 'buildingDecisionTrees' && (
                <section id="buildingDecisionTrees" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Building a Decision Tree Model</h2>
                    <p className={pInfoSectionClasses}>To build a Decision Tree model, follow these key steps:</p>
                    <ol className={olInfoSectionClasses}>
                        <li><strong>Collect Data:</strong> Gather a dataset with features (independent variables) and a target variable (dependent variable).</li>
                        <li><strong>Preprocess Data:</strong> Handle missing values, encode categorical variables if necessary, and split the dataset into training and testing sets.</li>
                        <li><strong>Select Features:</strong> Identify the features that will be used to split the data.</li>
                        <li><strong>Choose a Splitting Criterion:</strong> Decide on a criterion to measure the quality of splits, such as Information Gain (reduction in entropy) or Gini Impurity (impurity of a node).</li>
                        <li><strong>Build the Tree:</strong> Start with a root node and use the selected feature to split the data. Recursively apply the same process to each child node until a stopping criterion is met (e.g., maximum depth, minimum samples per leaf).</li>
                        <li><strong>Prune the Tree (if necessary):</strong> Simplify the tree by removing branches that do not improve performance to avoid overfitting.</li>
                        <li><strong>Evaluate the Model:</strong> Use the testing set to assess the model's accuracy and performance.</li>
                        <li><strong>Make Predictions:</strong> Use the trained Decision Tree to classify new data points based on the learned rules.</li>
                    </ol>
                    <p className={pInfoSectionClasses}>These steps will help you effectively build a Decision Tree model for classification tasks.</p>
                </section>
            )}
             {activeSection === 'selectingFeaturesDecisionTrees' && (
                <section id="selectingFeaturesDecisionTrees" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Selecting Features for Decision Trees</h2>
                    <p className={pInfoSectionClasses}>
                        Selecting features for a Decision Tree involves identifying the most relevant variables that will help in making accurate predictions. Here are the key methods:
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Feature Importance:</strong> After training, evaluate feature importance based on impurity reduction (Gini impurity or entropy). Features causing significant reductions are more important.</li>
                        <li><strong>Recursive Feature Elimination (RFE):</strong> Recursively remove the least important features and rebuild the model until the desired number of features is reached.</li>
                        <li><strong>Correlation Analysis:</strong> Analyze correlation between features and the target variable. Use Pearson or Spearman coefficients for continuous variables.</li>
                        <li><strong>Univariate Selection:</strong> Apply statistical tests (e.g., Chi-squared for categorical features) to select features with the strongest relationship to the target.</li>
                        <li><strong>Domain Knowledge:</strong> Leverage insights from the specific problem domain to select relevant features.</li>
                        <li><strong>Cross-Validation:</strong> Use cross-validation to assess model performance with different feature subsets to find the best combination.</li>
                    </ul>
                    <p className={pInfoSectionClasses}>
                        By applying these methods, you can effectively select features that enhance the performance of your Decision Tree model.
                    </p>
                </section>
            )}
            {activeSection === 'understandingSvm' && (
                <section id="understandingSvm" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Understanding Support Vector Machines (SVM)</h2>
                    <p className={pInfoSectionClasses}>
                        Support Vector Machines (SVM) are a supervised learning technique used for classification and regression tasks.
                    </p>
                    <h3 className={h3InfoSectionClasses}>Understanding SVM</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>SVM classifies data by identifying a hyperplane that separates two classes in a multidimensional space.</li>
                        <li>The goal is to maximize the margin between the classes, which improves the model's accuracy on new data.</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>SVM Mechanics</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>SVM can handle noisy data by incorporating a soft margin, allowing for some misclassifications.</li>
                        <li>The parameter <code className={inlineCodeInfoSectionClasses}>C</code> controls the trade-off between maximizing the margin and minimizing misclassifications.</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Applications and Limitations</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Applications:</strong> SVM is effective for high-dimensional data and tasks like image classification, spam detection, and sentiment analysis.</li>
                        <li><strong>Limitations:</strong> It can be slow with large datasets and sensitive to noise and the choice of kernel functions.</li>
                    </ul>
                </section>
            )}
            {activeSection === 'fraudDetectionSvmDt' && (
                <section id="fraudDetectionSvmDt" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Credit Card Fraud Detection: Decision Trees & SVM</h2>
                    <p className={pInfoSectionClasses}>
                        Credit card fraud detection is a common application of machine learning. Here's how Decision Trees and Support Vector Machines (SVM) can be applied:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-2">Decision Trees</h3>
                            <p className="text-slate-400 text-xs sm:text-sm mb-1"><strong>How it Works:</strong> Creates a model predicting a target variable based on input features, splitting data into branches leading to decisions.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> Features like transaction amount, location, time, and user behavior classify transactions as "fraudulent" or "legitimate."</p>
                        </div>
                        <div className="bg-slate-700 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-lg sm:text-xl font-semibold text-sky-400 mb-2">Support Vector Machines (SVM)</h3>
                            <p className="text-slate-400 text-xs sm:text-sm mb-1"><strong>How it Works:</strong> Finds the hyperplane that best separates classes in the feature space, maximizing the margin between them.</p>
                            <p className="text-slate-400 text-xs sm:text-sm"><strong>Application:</strong> Handles high-dimensional data effectively for fraud detection, classifying transactions by which side of the hyperplane they fall on.</p>
                        </div>
                    </div>
                    <h3 className={h3InfoSectionClasses}>Comparison</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Decision Trees:</strong> Easy to interpret and visualize, user-friendly for understanding decision processes.</li>
                        <li><strong>SVM:</strong> Powerful for complex datasets, can achieve high accuracy, but may require more tuning and is less interpretable.</li>
                    </ul>
                    <p className={pInfoSectionClasses}>
                        Both methods can be effective for credit card fraud detection, and often, combining them in an ensemble method can yield better results.
                    </p>
                </section>
            )}
            {activeSection === 'svmForFraudDetection' && (
                <section id="svmForFraudDetection" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Implementing SVM for Credit Card Fraud Detection</h2>
                    <p className={pInfoSectionClasses}>Implementing SVM for credit card fraud detection involves several steps. Here’s a concise outline:</p>
                    <ol className={olInfoSectionClasses}>
                        <li>
                            <strong>Data Collection:</strong> Gather a dataset with transaction records (amount, time, location, fraudulent status).
                        </li>
                        <li>
                            <strong>Data Preprocessing:</strong>
                            <ul className="list-disc list-inside ml-2 sm:ml-4 text-slate-400">
                                <li>Cleaning: Handle missing values, remove duplicates.</li>
                                <li>Normalization: Scale features to a similar range (important for SVM).</li>
                                <li>Encoding: Convert categorical variables to numerical format (e.g., one-hot encoding).</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Splitting the Dataset:</strong> Divide into training (e.g., 80%) and testing (e.g., 20%) sets.
                        </li>
                        <li>
                            <strong>Model Training:</strong>
                            <ul className="list-disc list-inside ml-2 sm:ml-4 text-slate-400">
                                <li>Import Scikit-learn libraries.</li>
                                <li>Create an SVM model with a suitable kernel (e.g., linear, RBF).
                                    <pre className={codeBlockInfoSectionClasses}>
                                        <code>{
`from sklearn import svm
model = svm.SVC(kernel='rbf') # or 'linear'
model.fit(X_train, y_train)`
                                        }</code>
                                    </pre>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <strong>Model Evaluation:</strong>
                             <ul className="list-disc list-inside ml-2 sm:ml-4 text-slate-400">
                                <li>Use the testing set for predictions: <code className={inlineCodeInfoSectionClasses}>predictions = model.predict(X_test)</code></li>
                                <li>Evaluate using metrics: accuracy, precision, recall, F1-score.</li>
                             </ul>
                        </li>
                        <li>
                            <strong>Hyperparameter Tuning:</strong> Optimize <code className={inlineCodeInfoSectionClasses}>C</code>, kernel type, etc., using Grid Search or Random Search.
                        </li>
                        <li>
                            <strong>Deployment:</strong> Deploy the model to monitor real-time transactions.
                        </li>
                    </ol>
                    <h3 className={h3InfoSectionClasses}>Example Code Snippet</h3>
                    <pre className={codeBlockInfoSectionClasses}>
                        <code>{
`import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn import svm
from sklearn.metrics import classification_report

# Load dataset
# data = pd.read_csv('credit_card_transactions.csv') # Assuming you have this file

# --- Placeholder for data loading and preprocessing ---
# For demonstration, let's create some dummy data if 'data' is not defined
try:
    data_exists = 'data' in locals() or 'data' in globals() 
    if not data_exists: 
      raise NameError("Data not loaded")
    if 'is_fraud' not in data.columns or len(data.columns) <=1 :
        print("Warning: 'is_fraud' column not found or insufficient features in loaded data. Using placeholder data for SVM snippet.")
        raise ValueError("Insufficient data")
    
    features_df = data.drop('is_fraud', axis=1) 
    features_df = pd.get_dummies(features_df, dummy_na=False) 
    features_df = features_df.fillna(features_df.mean()) 
    target_series = data['is_fraud']

except (NameError, ValueError, AttributeError) as e: 
    print(f"Data loading/validation error: {e}. Creating dummy data for SVM snippet.")
    from sklearn.datasets import make_classification
    features_array, target_array = make_classification(n_samples=100, n_features=5, random_state=42)
    features_df = pd.DataFrame(features_array, columns=[f'feature_{i}' for i in range(5)])
    target_series = pd.Series(target_array)
# --- End of Placeholder ---


# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(features_df, target_series, test_size=0.2, random_state=42)

# Normalize features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Train SVM model
model = svm.SVC(kernel='rbf') 
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_test)

# Evaluate model
print(classification_report(y_test, predictions))`
                        }</code>
                    </pre>
                </section>
            )}
            {activeSection === 'newsletterSignup' && (
              <section 
                id="newsletterSignup" 
                className={`info-section bg-slate-900 p-4 sm:p-6 md:p-12 rounded-xl shadow-xl mb-8 sm:mb-12 flex flex-col justify-center items-center min-h-[calc(100vh-20rem)] sm:min-h-[calc(100vh-25rem)]`}
              >
                <h2 className={h2InfoSectionClasses}>Join Our Newsletter</h2>
                <div className="card"> 
                  <h3 className="card__title">Stay Updated!</h3>
                  <p className="card__content">
                    Sign up to our newsletter to receive the latest AI industry trends and insights directly in your inbox.
                  </p>
                  <form className="card__form" onSubmit={(e) => {
                    e.preventDefault();
                    alert('Thank you for subscribing! (This is a demo and does not actually send emails.)');
                    (e.target as HTMLFormElement).reset(); 
                  }}>
                    <input type="email" placeholder="Enter your email" required aria-label="Email for newsletter" />
                    <button type="submit" className="sign-up">Sign Up</button>
                  </form>
                </div>
              </section>
            )}
            {activeSection === 'gpuGuidePersonal' && (
                <section id="gpuGuidePersonal" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Unleashing AI Power: Choosing the Right NVIDIA GPU (Personal)</h2>
                    <p className={pInfoSectionClasses}>
                        Starting your journey in AI and machine learning can be exciting, but choosing the right hardware, especially a GPU, is crucial for efficient development and training. NVIDIA GPUs are industry standard, offering significant computational power over CPUs for parallel processing tasks common in ML. This guide will help you select the ideal NVIDIA card for personal or small-scale projects, alongside the essential software tools for implementation.
                    </p>
                    <h3 className={h3InfoSectionClasses}>The Right NVIDIA Cards (Consumer Grade)</h3>
                    <p className={pInfoSectionClasses}>
                        For individual developers, students, and small teams, NVIDIA's consumer-grade RTX series offers an excellent balance of performance and cost-effectiveness. Key factors to consider are VRAM (Video RAM) and CUDA Cores.
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Entry-Level (e.g., RTX 3060, RTX 4060):</strong> Ideal for smaller neural networks and basic deep learning. (Price: Approx. €300 - €500)</li>
                        <li><strong>Mid-Range (e.g., RTX 3070, RTX 4070):</strong> Significant boost for moderately complex models and faster experimentation. (Price: Approx. €500 - €800)</li>
                        <li><strong>High-End (e.g., RTX 3080, RTX 3090, RTX 4090):</strong> Essential for larger models, high-resolution processing, and intensive research. RTX 3090/4090 with higher VRAM are particularly suited. (Price: Approx. €800 - €2000+)</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Essential Tools for Implementation</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>NVIDIA Drivers: Always install the latest compatible drivers.</li>
                        <li>CUDA Toolkit: NVIDIA's foundation for parallel computing on GPUs.</li>
                        <li>cuDNN: GPU-accelerated library optimized for deep neural network operations.</li>
                        <li>Deep Learning Frameworks: TensorFlow, PyTorch.</li>
                        <li>Environment Management: Anaconda/Miniconda, Docker (with NVIDIA Container Toolkit).</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Implementation Workflow</h3>
                    <ol className={olInfoSectionClasses}>
                        <li>Install NVIDIA Drivers.</li>
                        <li>Install CUDA Toolkit compatible with your setup.</li>
                        <li>Integrate cuDNN files into CUDA toolkit.</li>
                        <li>Set up a dedicated Python environment (e.g., with Anaconda).</li>
                        <li>Install GPU-compatible versions of TensorFlow or PyTorch.</li>
                        <li>Verify GPU utilization with a test script.</li>
                    </ol>
                </section>
            )}
            {activeSection === 'gpuGuideEnterprise' && (
                <section id="gpuGuideEnterprise" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Scaling AI: High-Performance NVIDIA Solutions (Enterprise)</h2>
                    <p className={pInfoSectionClasses}>
                        For enterprises, research institutions, and large-scale AI projects, the demands on computational resources are immense. Achieving breakthrough results, training colossal models, or deploying complex AI systems at scale requires more than just a powerful GPU – it demands a robust infrastructure, specialized hardware, and optimized software solutions. NVIDIA provides a comprehensive ecosystem tailored for these high-performance AI workloads.
                    </p>
                    <h3 className={h3InfoSectionClasses}>The Right NVIDIA Cards (Professional & Data Center Grade)</h3>
                    <p className={pInfoSectionClasses}>
                        When scaling AI, the focus shifts to GPUs designed for continuous, high-intensity compute in workstations or data centers.
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Workstation/Pro Grade (e.g., RTX A-series: A4000, A6000):</strong> Offer large VRAM (up to 48GB) and ECC memory for critical workloads. (Price: Approx. €800 - €5000+)</li>
                        <li><strong>Data Center/Enterprise Grade (e.g., NVIDIA A100, H100):</strong> Workhorses for large-scale AI training, featuring Tensor Cores and massive VRAM (up to 80GB for A100). H100 for generative AI and LLMs. (Price: Approx. €10,000 - €30,000+ per card)</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Specialized Tools & Platforms</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>NVIDIA CUDA-X Library: Collection of libraries for accelerating various AI domains.</li>
                        <li>NVIDIA AI Enterprise: End-to-end software suite for enterprise AI development and management.</li>
                        <li>NVIDIA Triton Inference Server: For deploying AI models at scale in production.</li>
                        <li>NVIDIA NeMo: For building, customizing, and deploying Large Language Models (LLMs).</li>
                    </ul>
                    <h3 className={h3InfoSectionClasses}>Advanced Implementation Strategies</h3>
                    <ul className={ulInfoSectionClasses}>
                        <li>Multi-GPU & Distributed Training: Speed up training for massive datasets using NVLink.</li>
                        <li>Cloud Infrastructure: Leverage cloud GPU instances for flexibility and scalability.</li>
                        <li>Containerization & Orchestration: Use Docker and Kubernetes with NVIDIA Container Toolkit.</li>
                        <li>Model Optimization: Mixed-precision training (FP16), pruning, quantization.</li>
                        <li>Efficient Data Pipelines: Build robust pipelines to feed massive datasets (e.g., Dask, Spark).</li>
                    </ul>
                </section>
            )}
            {activeSection === 'privacyPolicy' && (
                <section id="privacyPolicy" className={infoSectionBaseClasses}>
                    <h2 className={h2InfoSectionClasses}>Privacy Policy for Naga Codex - A.I Tools</h2>
                    <p className={pInfoSectionClasses}>
                        This Privacy Policy informs you about the nature, scope, and purpose of the processing of personal data within our online offering "Naga Codex - A.I Tools" (hereinafter referred to as "Website"). This Privacy Policy applies to all users and visitors of the Website.
                    </p>
                    <p className={pInfoSectionClasses}>
                        We take the protection of your personal data very seriously. Your data will be processed on the basis of legal provisions (in particular the General Data Protection Regulation – GDPR and applicable national data protection laws within the EU).
                    </p>

                    <h3 className={h3InfoSectionClasses}>1. Responsible Party</h3>
                    <p className={pInfoSectionClasses}>
                        The party responsible for data processing on this Website is:
                        <br />
                        Maurice Holda
                        <br />
                        Naga Codex
                        <br />
                        Based in Hamburg, Germany
                        <br />
                        Email: <a href="mailto:chosenfewrecords@hotmail.de" className="text-sky-400 hover:text-sky-300 underline">chosenfewrecords@hotmail.de</a>
                    </p>

                    <h3 className={h3InfoSectionClasses}>2. Type and Scope of Data Processing</h3>
                    <h4 className={h4InfoSectionClasses}>2.1. Access Data / Server Log Files</h4>
                    <p className={pInfoSectionClasses}>
                        When you merely visit our Website, we automatically collect information that your browser transmits to our server (so-called "server log files"). This includes:
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li>IP address of the requesting computer</li>
                        <li>Date and time of access</li>
                        <li>Name and URL of the retrieved file</li>
                        <li>Referrer URL (the previously visited page)</li>
                        <li>Browser used and, if applicable, the operating system of your computer</li>
                        <li>Name of your access provider</li>
                    </ul>
                    <p className={pInfoSectionClasses}>
                        This data is processed for the purposes of ensuring a smooth connection setup of the Website, securing system stability and security, and for administrative purposes. This data is not combined with other data sources. The legal basis for data processing is Art. 6 (1) lit. f GDPR (legitimate interest).
                    </p>

                    <h4 className={h4InfoSectionClasses}>2.2. Contacting Us</h4>
                    <p className={pInfoSectionClasses}>
                        If you contact us via email or a contact form (if available), the data you provide (your email address, and if applicable, your name and phone number, as well as the content of your message) will be stored by us to process and respond to your inquiry. We will not share this data without your consent.
                        The processing of this data is based on your consent (Art. 6 (1) lit. a GDPR) or for the performance of pre-contractual measures or for the fulfillment of a contract (Art. 6 (1) lit. b GDPR), provided that your inquiry aims at this.
                    </p>

                    <h4 className={h4InfoSectionClasses}>2.3. No Further Data Collection</h4>
                    <p className={pInfoSectionClasses}>
                        This Website is a purely informational service (directory of AI tools). No personal user accounts are created, no registrations are made, and no direct payments are processed via the Website. Furthermore, no tracking tools (such as Google Analytics, Matomo, etc.) are used that comprehensively analyze your behavior on the Website unless consent is given via the cookie banner.
                    </p>

                    <h3 className={h3InfoSectionClasses}>3. Purpose of Data Processing</h3>
                    <p className={pInfoSectionClasses}>
                        The processing of your data serves exclusively to ensure the operation of the Website, to provide our services, to communicate with you, and to ensure the security of our IT systems. Your data will not be used for marketing purposes without explicit consent.
                    </p>

                    <h3 className={h3InfoSectionClasses}>4. Data Recipients / Third-Party Providers</h3>
                    <p className={pInfoSectionClasses}>
                        We work with service providers who support us in providing the Website. These include, for example, hosting providers. These service providers process data exclusively on our behalf and are contractually obliged to comply with data protection regulations. Your personal data will not be disclosed to unauthorized third parties.
                    </p>

                    <h3 className={h3InfoSectionClasses}>5. Retention Period of Personal Data</h3>
                    <p className={pInfoSectionClasses}>
                        Access data (server log files) are stored for a maximum period of 7 days and then anonymized or deleted. Data you send us via contact inquiries will be deleted once your inquiry has been fully processed and no legal retention obligations prevent deletion.
                    </p>

                    <h3 className={h3InfoSectionClasses}>6. Your Rights as a Data Subject (GDPR)</h3>
                    <p className={pInfoSectionClasses}>
                        You have the right to receive information about the personal data stored about you at any time. Furthermore, you have the following rights:
                    </p>
                    <ul className={ulInfoSectionClasses}>
                        <li><strong>Right of Access (Art. 15 GDPR):</strong> You have the right to obtain confirmation as to whether or not personal data concerning you are being processed, and, where that is the case, access to the personal data.</li>
                        <li><strong>Right to Rectification (Art. 16 GDPR):</strong> You have the right to obtain without undue delay the rectification of inaccurate personal data concerning you, or to have incomplete personal data completed.</li>
                        <li><strong>Right to Erasure ("Right to be Forgotten") (Art. 17 GDPR):</strong> You have the right to obtain the immediate erasure of your personal data where the conditions of Art. 17 GDPR are met.</li>
                        <li><strong>Right to Restriction of Processing (Art. 18 GDPR):</strong> You have the right to obtain restriction of processing where the conditions of Art. 18 GDPR are met.</li>
                        <li><strong>Right to Data Portability (Art. 20 GDPR):</strong> You have the right to receive the personal data concerning you, which you have provided to us, in a structured, commonly used and machine-readable format and have the right to transmit those data to another controller.</li>
                        <li><strong>Right to Object (Art. 21 GDPR):</strong> You have the right to object, on grounds relating to your particular situation, at any time to processing of personal data concerning you which is based on Art. 6 (1) lit. e or f GDPR. This also applies to profiling based on these provisions.</li>
                        <li><strong>Right to Withdraw Consent (Art. 7 (3) GDPR):</strong> Where processing is based on your consent, you have the right to withdraw your consent at any time. The lawfulness of processing based on consent before its withdrawal remains unaffected.</li>
                        <li><strong>Right to Lodge a Complaint with a Supervisory Authority (Art. 77 GDPR):</strong> Without prejudice to any other administrative or judicial remedy, you have the right to lodge a complaint with a supervisory authority, in particular in the Member State of your habitual residence, place of work or place of the alleged infringement if you consider that the processing of personal data relating to you infringes the GDPR.</li>
                    </ul>
                    <p className={pInfoSectionClasses}>
                        To exercise your rights, please contact us at the email address provided above: <a href="mailto:chosenfewrecords@hotmail.de" className="text-sky-400 hover:text-sky-300 underline">chosenfewrecords@hotmail.de</a>.
                    </p>

                    <h3 className={h3InfoSectionClasses}>7. Data Security</h3>
                    <p className={pInfoSectionClasses}>
                        We implement appropriate technical and organizational security measures to protect your data against accidental or intentional manipulation, partial or complete loss, destruction, or unauthorized access by third parties. Our security measures are continuously improved in line with technological developments.
                    </p>

                    <h3 className={h3InfoSectionClasses}>8. Changes to this Privacy Policy</h3>
                    <p className={pInfoSectionClasses}>
                        We reserve the right to adapt this Privacy Policy to always comply with current legal requirements or to implement changes to our services in the Privacy Policy, e.g., when introducing new services. For your renewed visit, the new Privacy Policy will then apply.
                    </p>
                    <p className={`${pInfoSectionClasses} text-xs sm:text-sm text-slate-400`}>Last Updated: June 5, 2025</p>
                </section>
            )}

        </div>
      </main>

      {/* Chat FAB */}
      <button
        onClick={toggleChat}
        title="Open AI Chat Assistant"
        aria-label="Open AI Chat Assistant"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-sky-600 hover:bg-sky-700 text-white p-3 sm:p-4 rounded-full shadow-lg z-[60] transition-transform duration-200 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-[70]"
          onClick={(e) => { if (e.target === e.currentTarget) toggleChat();}} 
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatModalTitle"
        >
          <div className="bg-slate-800 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] sm:h-[75vh] md:h-[70vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700 bg-slate-700/50">
              <h3 id="chatModalTitle" className="text-md sm:text-lg font-semibold text-sky-300">Naga Codex AI Assistant</h3>
              <button 
                onClick={toggleChat} 
                className="text-slate-400 hover:text-sky-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-grow p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[75%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg shadow text-xs sm:text-sm ${
                      msg.sender === 'user' ? 'bg-sky-600 text-white' : 
                      msg.sender === 'model' ? 'bg-slate-700 text-slate-200' :
                      'bg-red-700 text-red-100 italic' 
                    }`}
                  >
                    {msg.text.split('\n').map((line, i) => <p key={i} className="whitespace-pre-wrap">{line}</p>)}
                  </div>
                </div>
              ))}
              <div ref={chatMessagesEndRef} /> 
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-700 bg-slate-700/50">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-start space-x-2">
                <textarea
                  value={chatInput}
                  onChange={handleChatInputChange}
                  placeholder={isChatLoading ? "Naga Codex is typing..." : "Ask an AI question..."}
                  rows={1} // Start with 1 row, can expand
                  style={{minHeight: '40px', maxHeight: '120px'}} // Control min/max height
                  className="flex-grow p-2 bg-slate-600 text-slate-100 rounded-md border border-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none disabled:opacity-70 text-sm sm:text-base"
                  disabled={isChatLoading || !chatInstance}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onInput={(e) => { // Auto-resize textarea
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim() || !chatInstance}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 h-[40px] sm:h-[44px] flex items-center justify-center" 
                  aria-label="Send message"
                >
                   {isChatLoading ? (
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                   )}
                </button>
              </form>
              {!process.env.API_KEY && (
                <p className="text-xs text-red-400 mt-2 text-center">Chatbot disabled: API Key for Gemini not configured in environment variables.</p>
              )}
            </div>
          </div>
        </div>
      )}


      <footer className="bg-slate-800 text-center p-4 sm:p-6 mt-auto border-t border-slate-700"> 
        <p className="text-slate-400 text-xs sm:text-sm">&copy; {new Date().getFullYear()} AI Assistant Revolution Report. All rights reserved.</p>
        <p className="text-slate-500 text-xs mt-1">Powered by Naga Codex</p>
        <p className="text-slate-500 text-xs mt-2"> 
          Contact: <a href="mailto:chosenfewrecords@hotmail.de" className="hover:text-sky-400 underline transition-colors duration-150">chosenfewrecords@hotmail.de</a>
        </p>
      </footer>
    </div>
  );
};

export default App;