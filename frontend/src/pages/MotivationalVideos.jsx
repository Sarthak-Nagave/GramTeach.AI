// src/pages/Motivation.jsx
export default function MotivationalVideos() {
  const yt = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  const videos = {
    marathi: [
      { title: "हार मानू नकोस!", id: "ZLuqf31MM8s", url: "https://youtu.be/ZLuqf31MM8s" },
      { title: "स्वतःवर विश्वास ठेव", id: "zIBY9Zw8_nk", url: "https://youtu.be/zIBY9Zw8_nk" },
      { title: "यशाची गुरुकिल्ली", id: "ch_KJtgPyxk", url: "https://youtu.be/ch_KJtgPyxk" },
      { title: "वेळेचे महत्व", id: "k346AxPme9M", url: "https://youtu.be/k346AxPme9M" },
      { title: "शिकत रहा, वाढत रहा", id: "l9r1nsj6iYU", url: "https://youtu.be/l9r1nsj6iYU" },
      { title: "कठीण प्रसंगांची कथा", id: "CBM-SEExy34", url: "https://youtu.be/CBM-SEExy34" },
      { title: "खऱ्या आयुष्यातील प्रेरणा", id: "wmRTJ8xfB0A", url: "https://youtu.be/wmRTJ8xfB0A" },
      { title: "उज्ज्वल भविष्यासाठी तयारी", id: "rl9pNYh0awo", url: "https://youtu.be/rl9pNYh0awo" },
      { title: "यशाचे नियम", id: "T9owghQ6JI4", url: "https://youtube.com/shorts/T9owghQ6JI4" },
      { title: "ताण कमी कसा करावा", id: "tUjyHXLZ9vM", url: "https://youtu.be/tUjyHXLZ9vM" },
    ],

    hindi: [
      { title: "हार मत मानो", id: "YEgjhjsHDNw", url: "https://youtu.be/YEgjhjsHDNw" },
      { title: "सपने सच होते हैं", id: "WPz_Z4EqUFk", url: "https://youtu.be/WPz_Z4EqUFk" },
      { title: "मेहनत का फल", id: "5YoTP_fO4FI", url: "https://youtu.be/5YoTP_fO4FI" },
      { title: "दुनिया बदलो", id: "KW-4K5NWRMs", url: "https://youtu.be/KW-4K5NWRMs" },
      { title: "मोटिवेशन की शक्ति", id: "GPEUgi7X91E", url: "https://youtu.be/GPEUgi7X91E" },
      { title: "कभी रुकना मत", id: "AfT53iTD5ds", url: "https://youtu.be/AfT53iTD5ds" },
      { title: "जीवन का असली अर्थ", id: "7qJrppvgRJw", url: "https://youtu.be/7qJrppvgRJw" },
      { title: "सपनों की उड़ान", id: "RnIfof2UGEk", url: "https://youtu.be/RnIfof2UGEk" },
      { title: "लक्ष्य कैसे प्राप्त करें", id: "fd2_WBcv0yE", url: "https://youtu.be/fd2_WBcv0yE" },
      { title: "खुद को पहचानो", id: "M2lt63iLM_o", url: "https://youtu.be/M2lt63iLM_o" },
    ],

    english: [
      { title: "Believe in Yourself", id: "AjZ0KbJcav0", url: "https://youtu.be/AjZ0KbJcav0" },
      { title: "Never Give Up", id: "PjP9r-HU4fk", url: "https://youtu.be/PjP9r-HU4fk" },
      { title: "You Are Stronger Than You Think", id: "p-PqLpKdkOg", url: "https://youtu.be/p-PqLpKdkOg" },
      { title: "Discipline Wins", id: "vAvjQK6hnIk", url: "https://youtu.be/vAvjQK6hnIk" },
      { title: "Dream Big", id: "tbnzAVRZ9Xc", url: "https://youtu.be/tbnzAVRZ9Xc" },
      { title: "Success Mindset", id: "V_ukiT_QNsQ", url: "https://youtu.be/V_ukiT_QNsQ" },
      { title: "Stay Hungry, Stay Foolish", id: "va9Ldn3ISSM", url: "https://youtu.be/va9Ldn3ISSM" },
      { title: "Small Steps Every Day", id: "rW7-4YdlC4Y", url: "https://youtu.be/rW7-4YdlC4Y" },
      { title: "Rise After Failure", id: "dww3Oo8ropA", url: "https://youtu.be/dww3Oo8ropA" },
      { title: "Your Future Starts Now", id: "vWaW3G8Ck2w", url: "https://youtu.be/vWaW3G8Ck2w" },
    ],
  };

  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <h1 className="h1" style={{ marginBottom: 20 }}>Motivational Videos</h1>

      {Object.entries(videos).map(([lang, list]) => (
        <section key={lang} style={{ marginBottom: 40 }}>
          
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--accent-400)",
            }}
          >
            {lang === "marathi" && "Marathi Videos"}
            {lang === "hindi" && "Hindi Videos"}
            {lang === "english" && "English Videos"}
          </h2>

          <div className="grid-3">
            {list.map((v, i) => (
              <div key={i} className="card" style={{ transition: "0.25s" }}>
                
                <img
                  src={yt(v.id)}
                  className="rounded-lg"
                  style={{
                    width: "100%",
                    height: 170,
                    objectFit: "cover",
                    marginBottom: 12,
                    borderRadius: 12,
                  }}
                  alt={v.title}
                />

                <h3 style={{ color: "var(--text)", fontWeight: 700, marginBottom: 6 }}>
                  {v.title}
                </h3>

                <a
                  href={v.url}
                  target="_blank"
                  className="btn btn-primary"
                  style={{ marginTop: 10, display: "inline-flex" }}
                >
                  Watch →
                </a>

              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
