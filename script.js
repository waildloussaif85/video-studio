const translations = {
    en: {
        title: "TikTok & Reels Video Maker",
        placeholder: "Enter your text here...",
        size: "Size:",
        audio: "Audio:",
        font: "Font color:",
        bg: "Background:",
        motion: "Moving text",
        generate: "Generate Video Now 🔥",
        loading: "Processing... Please wait",
        imageBtn: "📷 Image",
        audioBtn: "🎵 Music",
        imageLoaded: "📷 Image Loaded",
        audioLoaded: "🎵 Music Loaded"
    },
    ar: {
        title: "TikTok & Reels Video Maker",
        placeholder: "اكتب النص هنا...",
        size: "الحجم:",
        audio: "الصوت:",
        font: "الخط:",
        bg: "الخلفية:",
        motion: "نص متحرك",
        generate: "Generate Video Now 🔥",
        loading: "جاري المعالجة... يرجى الانتظار",
        imageBtn: "📷 Image",
        audioBtn: "🎵 Music",
        imageLoaded: "📸 Image Loaded",
        audioLoaded: "🎵 Music Loaded"
    }
};

let currentLang = 'ar';

const textInput = document.getElementById('videoText');
const sizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const bgColorInput = document.getElementById('bgColor');
const motionCheck = document.getElementById('motionText');
const imageFileInput = document.getElementById('imageFile');
const audioFileInput = document.getElementById('audioFile');
const generateBtn = document.getElementById('lbl-btn');
const statusMessage = document.getElementById('statusMessage');
const videoPreviewBox = document.getElementById('videoPreviewBox');

const lblImage = document.getElementById('lbl-imageBtn') || document.querySelector('label[for="imageFile"]');
const lblAudio = document.getElementById('lbl-audioBtn') || document.querySelector('label[for="audioFile"]');

document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    const startBtn = document.querySelector('.splash-btn');
    
    if (startBtn && splash) {
        startBtn.addEventListener('click', () => {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.4s ease';
            setTimeout(() => { splash.style.display = 'none'; }, 400);
        });
    }
    switchLanguage(currentLang);
});

window.switchLanguage = function(lang) {
    currentLang = lang;
    document.querySelectorAll('[id^="lbl-"]').forEach(el => {
        const key = el.id.replace('lbl-', '');
        if (translations[lang][key]) { el.innerText = translations[lang][key]; }
    });
    if(textInput) textInput.placeholder = translations[lang].placeholder;
};

// تحديث اسم الزر عند اختيار صورة
if(imageFileInput) {
    imageFileInput.addEventListener('change', () => {
        if(imageFileInput.files.length > 0 && lblImage) {
            lblImage.innerText = translations[currentLang].imageLoaded;
        }
    });
}

if(audioFileInput) {
    audioFileInput.addEventListener('change', () => {
        if(audioFileInput.files.length > 0 && lblAudio) {
            lblAudio.innerText = translations[currentLang].audioLoaded;
        }
    });
}

// توليد المعاينة الحية المحدثة بالصورة والحركة الرأسية
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    statusMessage.style.color = "#00f2fe";
    statusMessage.innerText = translations[currentLang].loading;
    videoPreviewBox.style.display = "none";

    setTimeout(() => {
        statusMessage.innerText = "";
        videoPreviewBox.style.display = "block";
        generateBtn.disabled = false;

        // مراجعة وجود صورة خلفية مرفوعة
        let bgStyle = `background: ${bgColorInput.value};`;
        if (imageFileInput && imageFileInput.files && imageFileInput.files.length > 0) {
            const imgURL = URL.createObjectURL(imageFileInput.files[0]);
            bgStyle = `background-image: url('${imgURL}'); background-size: cover; background-position: center;`;
        }
        
        // بناء صندوق المعاينة بالخلفية المحدثة
        videoPreviewBox.innerHTML = `
            <div id="livePreviewCanvas" style="
                width: 100%; 
                height: 280px; 
                border-radius: 12px; 
                ${bgStyle}
                display: flex; 
                justify-content: center; 
                align-items: center; 
                overflow: hidden;
                position: relative;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
            ">
                <div id="previewTextNode" style="
                    color: ${fontColorInput.value}; 
                    font-size: ${sizeInput.value}px; 
                    font-weight: bold;
                    text-align: center;
                    position: absolute;
                    width: 100%;
                ">${textInput.value || "AI Studio"}</div>
            </div>
            <a id="downloadLink" class="download-btn" style="margin-top: 12px; display: inline-block;">Save to Phone / حفظ</a>
        `;

        // تفعيل الحركة الرأسية (من فوق لوطة)
        const textNode = document.getElementById('previewTextNode');
        if (motionCheck.checked && textNode) {
            textNode.style.animation = "moveTextVertical 4s linear infinite alternate";
            
            if (!document.getElementById('verticalMotionStyle')) {
                const style = document.createElement('style');
                style.id = 'verticalMotionStyle';
                style.innerHTML = `
                    @keyframes moveTextVertical {
                        0% { top: 10%; transform: translateY(0); }
                        100% { top: 80%; transform: translateY(-100%); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, 1200);
});
