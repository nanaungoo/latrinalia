---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

section {
  /* Grimy, off-white tile aesthetic */
  background-color: #f4f4f0;
  background-image: linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  color: #1a1a1a;
  font-family: 'Helvetica Neue', Arial, sans-serif; /* Clean base for Myanmar text */
}

h1 {
  /* Sharpie marker look for headers */
  font-family: 'Permanent Marker', cursive;
  color: #0b2265; /* Dark ink blue */
  text-transform: uppercase;
  transform: rotate(-1.5deg); /* Slight scribble tilt */
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

strong {
  color: #d11141; /* Red marker for emphasis */
}

/* --- Layout fixes for Slide 6 --- */
.two-column {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 30px;
  align-items: center;
  margin-top: 10px;
}

.done-list li {
  font-family: 'Permanent Marker', cursive;
  color: #1a1a1a;
  font-size: 1.1em;
  margin-bottom: 0.3em;
}

.qr-container {
  text-align: center;
}

.qr-container img {
  width: 220px;
  height: 220px;
  border: 4px solid #1a1a1a;
  border-radius: 10px;
  transform: rotate(2deg);
}

.qr-text {
  font-family: 'Permanent Marker', cursive;
  color: #d11141;
  font-size: 1.4em;
  margin-top: 10px;
  transform: rotate(-2deg);
}

/* Buy Me a Coffee Tip Jar with custom QR and static button */
.tip-jar {
  margin-top: 10px;
  padding: 10px;
  border: 3px dashed #d11141;
  background-color: rgba(209, 17, 65, 0.05);
  font-family: 'Permanent Marker', cursive;
  font-size: 1.05em;
  transform: rotate(1deg);
  display: flex;
  align-items: center;
  gap: 15px;
}

.tip-jar-content {
  flex: 1;
}

.tip-jar img {
  width: 100px;
  height: 100px;
  border: 2px solid #1a1a1a;
  border-radius: 5px;
  transform: rotate(-3deg);
}

/* Pure CSS Fake BMC Button */
.bmc-button {
  display: inline-block;
  background-color: #FFDD00;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 8px;
  padding: 5px 12px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: bold;
  text-decoration: none !important;
  margin-top: 8px;
  box-shadow: 2px 2px 0px #000000;
  transition: transform 0.1s;
}
</style>

<!-- slide 1 -->
# 🚽 Who's my person? (ဘယ်သူတွေအတွက်လဲ)
<!-- 20s -->
အများသုံးအိမ်သာတက်ရင်း တံခါးက စာတွေကိုဖတ်ပြီး ကိုယ်တိုင်ဝင်ရေးချင်စိတ် ပေါက်သွားသူတိုင်းအတွက်ပါ။ အမည်မသိ စာရေးဆရာများ၊ အိမ်သာတွင်း ဒဿနပညာရှင်များနဲ့ လူမသိသူမသိ ရင်ဖွင့်ချင်သူတွေပေါ့။

---

<!-- slide 2 -->
# 🚫 Their problem (သူတို့ရဲ့ အခက်အခဲ)
အပြင်က အိမ်သာနံရံစာတွေက အဲ့ဒီတစ်ခန်းတည်းမှာပဲ ပိတ်မိနေတယ်။ တစ်မြို့လုံးက ဘာတွေရေးနေလဲ သိလို့မရဘူးလေ။ ပြီးတော့ App Store တွေကလည်း အမည်မသိရေးလို့ရတဲ့ UGC App တွေကို ပိတ်ပင်ထားတယ်။ **အိမ်သာတံခါးဆိုတာ ဘယ်သူမှ လိုက်မထိန်းချုပ်ထားတဲ့ နောက်ဆုံး Social Network ပါပဲ။** အခုထိ ဘယ်သူမှ အွန်လိုင်းပေါ် သေချာမတင်ပေးရသေးဘူး။

---

<!-- slide 3 -->
# 📱 What I built (ဘာဖန်တီးလိုက်လဲ)
**Latrinalia** — အိမ်သာနံရံကို ဒစ်ဂျစ်တယ်ပြောင်းထားတဲ့ Progressive Web App ပါ။ အခန်းကိုရွေး၊ စာရေး၊ ကြိုက်သလိုရွှေ့ပြီး နံရံကြီးဘယ်လိုပြောင်းလဲသွားမလဲ စောင့်ကြည့်ရုံပဲ။ အကောင့်ဖွင့်စရာမလို၊ နာမည်မလို၊ App Store လည်းမလိုဘူး။ ၇ ရက်တစ်ခါ အဟောင်းတွေကို လိုက်ဖျက်ပေးမယ့် ‘သန့်ရှင်းရေးဝန်ထမ်း (Janitor Mode)’ လည်း ပါသေးတယ်။

---

<!-- slide 4 -->
# 🛠️ How I built it (ဘယ်လို တည်ဆောက်ခဲ့လဲ)
* **MCP:** `.mcp.json` ထဲက SQLite MCP server ကိုသုံးထားပြီး API Key တွေမလိုဘဲ Claude က Database ကို တိုက်ရိုက်ပြင်ပေးတယ်။
* **Skill:** `graffiti-wall` skill ကနေ Claude ကို နံရံတွေဖန်တီးဖို့၊ စာရေးဖို့နဲ့ သန့်ရှင်းရေးလုပ်ဖို့ သင်ပေးထားတယ်။
* **Agent:** `sticker-reviewer` agent ကတော့ စာတွေကို စစ်ဆေးပေးမယ့် (ထားမလား၊ သတိပေးမလား၊ ဖျက်ပစ်မလား) Content Moderation Agent ဖြစ်တယ်။

---

<!-- slide 5 -->
# 💡 Why it matters (ဘာကြောင့် အရေးပါတာလဲ)
* Cloud အကောင့်တွေ၊ App Store ခွင့်ပြုချက်တွေမပါဘဲ Real-time Social App တွေ အသက်ဝင်နိုင်တယ်ဆိုတာ သက်သေပြလိုက်တာပဲ။ 
* **SQLite နဲ့ PWA ရှိရင် လုံလောက်ပြီလေ။**
* Claude Code ရဲ့ Extension Point ၃ ခုစလုံးက နာမည်ခံသက်သက်မဟုတ်ဘဲ လက်တွေ့ပြဿနာတွေကို တကယ်ဖြေရှင်းပေးသွားတယ်။

---

<!-- slide 6 -->
# 📋 The Janitor's Log (ပြီးစီးမှု မှတ်တမ်း)

<div class="two-column">

<div class="done-list">

- 📢 အများပြည်သူ ဝင်ရေးလို့ရပြီ (Repo is public)
- 🤖 စက်ရုပ်တွေနဲ့ အလုပ်လုပ်ထားတယ် (MCP + Skill + Agent integrated)
- 💔 fa တွေအသဲကွဲလို့ရပြီ (forever alone)

<div class="tip-jar">
  <div class="tip-jar-content">
    <strong>🧻 Keep the bathroom open!</strong><br>
    Server/VPS တွေဆက်သုံးနိုင်ဖို့နဲ့ သန့်ရှင်းရေးသမားကိုကာဖေးတိုက်ချင်ရင် ➡️  <br>
    <a href="https://buymeacoffee.com/nanaungoo" class="bmc-button">☕ ကာဖေးတိုက်မယ်</a>
  </div>
  <img src="qr-code.png" alt="Buy Me A Coffee Custom QR">ကာဖေး
</div>

</div>

<div class="qr-container">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://weathered-heart-9488.nannaungoo.workers.dev/" alt="Latrinalia App QR Code">
  <div class="qr-text"> ⬆️ စကန်ဖတ်ပြီး ရင်ဖွင့်လိုက်! </div>
</div>

</div>