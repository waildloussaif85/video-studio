const translations = {
    en: {
        title: "TikTok & Reels Video Maker",
        btn: "Generate Video Now 🔥",
        loading: "⏳ Rendering Generic Scroll Text animation...",
        success: "🎉 Video created successfully!",
        error: "❌ Error processing video."
    },
    ar: {
        title: "صانع فيديوهات تيك توك وريلز",
        btn: "🔥 اصنع الفيديو الآن",
        loading: "⏳ جاري تطبيق حركة الجينيريك السينمائية وتوليد الفيديو...",
        success: "🎉 تم إنشاء الفيديو بنجاح! جاهز للحفظ",
        error: "❌ حدث خطأ أثناء معالجة الفيديو."
    }
}

let currentLang = 'en';

function enterApp() {
    document.getElementById('splash-screen').style.display = "none";
}

window.onload = function() {
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.startsWith('ar')) {
        switchLanguage('ar');
    }
};

function switchLanguage(lang) {
    currentLang = lang;
    document.getElementById('lbl-title').innerText = translations[lang].title;
    document.getElementById('lbl-btn').innerText = translations[lang].btn;
    
    if (lang === 'ar') {
        document.getElementById('videoText').placeholder = "أدخل النص هنا...";
        document.getElementById('lbl-size').innerText = "الحجم:";
        document.getElementById('lbl-vol').innerText = "الصوت:";
        document.getElementById('lbl-color').innerText = "الخط:";
        document.getElementById('lbl-bg').innerText = "الخلفية:";
        document.getElementById('lbl-motion').innerText = "تحريك سينمائي";
        document.getElementById('lbl-image').innerText = "الصورة 📸";
        document.getElementById('lbl-audio').innerText = "الموسيقى 🎵";
        document.body.style.direction = 'rtl';
    } else {
        document.getElementById('videoText').placeholder = "Enter your text here...";
        document.getElementById('lbl-size').innerText = "Size:";
        document.getElementById('lbl-vol').innerText = "Vol:";
        document.getElementById('lbl-color').innerText = "Text:";
        document.getElementById('lbl-bg').innerText = "Bg:";
        document.getElementById('lbl-motion').innerText = "Cinematic Move";
        document.getElementById('lbl-image').innerText = "Image 📸";
        document.getElementById('lbl-audio').innerText = "Music 🎵";
        document.body.style.direction = 'ltr';
    }
}

document.getElementById('audioFile').addEventListener('change', function() {
    updateFileStatus();
});
document.getElementById('imageFile').addEventListener('change', function() {
    updateFileStatus();
});

function updateFileStatus() {
    const audio = document.getElementById('audioFile').files.length ? "🎵 Audio Loaded" : "";
    const img = document.getElementById('imageFile').files.length ? "📸 Image Loaded" : "";
    document.getElementById('fileStatusMessage').innerText = [img, audio].filter(Boolean).join(' | ');
}

async function generateVideo() {
    const videoText = document.getElementById('videoText').value;
    const audioFiles = document.getElementById('audioFile').files;
    const imageFiles = document.getElementById('imageFile').files;
    
    const chosenSize = document.getElementById('textSizeSlider').value;
    const chosenColor = document.getElementById('textColorPicker').value;
    const chosenBgColor = document.getElementById('bgColorPicker').value;
    const chosenVolume = document.getElementById('volumeSlider').value;
    const isAnimated = document.getElementById('motionCheckbox').checked;

    const generateBtn = document.getElementById('lbl-btn');
    const statusMessage = document.getElementById('statusMessage');
    const videoPreviewBox = document.getElementById('videoPreviewBox');
    const videoPlayer = document.getElementById('videoPlayer');
    const downloadLink = document.getElementById('downloadLink');

    if (!videoText) {
        alert(currentLang === 'ar' ? 'الرجاء إدخال نص أولاً!' : 'Please enter text first!');
        return;
    }

    generateBtn.disabled = true;
    statusMessage.style.color = "#00f2fe";
    statusMessage.innerText = translations[currentLang].loading;
    videoPreviewBox.style.display = "none";

    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 720;  
        canvas.height = 1280;

        let img = null;
        if (imageFiles.length > 0) {
            img = new Image();
            img.src = URL.createObjectURL(imageFiles);
            await new Promise((resolve) => img.onload = resolve);
        }

        const stream = canvas.captureStream(30); 
        
        if (audioFiles.length > 0) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioEl = new Audio(URL.createObjectURL(audioFiles));
            audioEl.volume = chosenVolume; 

            const audioNode = audioContext.createMediaElementSource(audioEl);
            const dest = audioContext.createMediaStreamDestination();
            audioNode.connect(dest);
            audioNode.connect(audioContext.destination); 
            audioEl.play();
            stream.addTrack(dest.stream.getAudioTracks());
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            const videoUrl = URL.createObjectURL(blob);
            videoPlayer.src = videoUrl;
            downloadLink.href = videoUrl;
            
            statusMessage.style.color = "#38ef7d";
            statusMessage.innerText = translations[currentLang].success;
            videoPreviewBox.style.display = "block";
            generateBtn.disabled = false;
        };

        mediaRecorder.start();

        let bgScale = 1.0;
        
        // نقطة البداية العمودية للنص: يبدأ من أسفل لو كان متحركاً جينيريك، أو في المنتصف لو كان ثابتاً
        let currentScrollY = isAnimated ? canvas.height : canvas.height / 2;
        const scrollSpeed = 2.2; // سرعة صعود النص للأعلى إطار بإطار كالجينيريك

        function drawFrame() {
            if (mediaRecorder.state !== "recording") return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (img) {
                bgScale += 0.0004; 
                const w = canvas.width * bgScale;
                const h = canvas.height * bgScale;
                const x = (canvas.width - w) / 2;
                const y = (canvas.height - h) / 2;
                ctx.drawImage(img, x, y, w, h);

                ctx.fillStyle = "rgba(0, 0, 0, 0.45)"; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, chosenBgColor);
                gradient.addColorStop(0.5, '#1e1b29');
                gradient.addColorStop(1, '#111216');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // تحديث موقع النص عمودياً ليرتفع للأعلى ببطء وسلاسة (Generic Motion)
            if (isAnimated) {
                currentScrollY -= scrollSpeed;
            }

            ctx.save();

            ctx.fillStyle = chosenColor; 
            ctx.font = `bold ${chosenSize}px Arial`; 
            ctx.textAlign = "center";
            ctx.shadowColor = "black";
            ctx.shadowBlur = 15;

            const words = videoText.split(' ');
            let line = '';
            let textY = currentScrollY; 
            const fontSizeParsed = parseInt(chosenSize);
            const lineHeight = fontSizeParsed + 20; 

            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                if (ctx.measureText(testLine).width > canvas.width - 120 && n > 0) {
                    ctx.fillText(line, canvas.width / 2, textY);
                    line = words[n] + ' ';
                    textY += lineHeight;
                } else { line = testLine; }
            }
            ctx.fillText(line, canvas.width / 2, textY);

            ctx.restore();

            requestAnimationFrame(drawFrame);
        }

        drawFrame();

        setTimeout(() => { mediaRecorder.stop(); }, 10000);

    } catch (error) {
        console.error(error);
        statusMessage.style.color = "#fe2c55";
        statusMessage.innerText = translations[currentLang].error;
        generateBtn.disabled = false;
    }
}
