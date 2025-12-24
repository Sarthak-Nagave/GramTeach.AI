// src/pages/RuralPath.jsx

const skills = [
  {
    name: "Digital Basics",
    videos: [
      {
        title: "How to Use Smartphone",
        thumb: "https://i.dailymail.co.uk/1s/2022/04/20/14/56833089-0-image-a-24_1650459939493.jpg",
        url: "https://youtu.be/W4NeW_9FQd0?si=oq3rl0-ItO3V4yHx"
      },
      {
        title: "UPI Payments Easy Guide",
        thumb: "https://ebz-static.s3.ap-south-1.amazonaws.com/easebuzz-static/UPI-Payments.png",
        url: "https://youtu.be/iI2NaN_QVTI?si=ZP5MZagW8Oiqq5f3"
      }
    ]
  },

  {
    name: "Mobile Tech",
    videos: [
      {
        title: "Understanding Mobile Apps",
        thumb: "https://www.spaceotechnologies.com/wp-content/uploads/2023/10/what-is-a-mobile-app.jpg",
        url: "https://youtu.be/CicYsYLQiQw?si=S9cgXO2BzJULI3Tp"
      }
    ]
  },

  {
    name: "AI for Farmers",
    videos: [
      {
        title: "Weather & Crop Insights",
        thumb: "https://eos.com/wp-content/uploads/2023/11/intro-web.png.webp",
        url: "https://youtu.be/QYavdH_L9Yg?si=8SFdgKoMaNUnVfgM"
      }
    ]
  },

  {
    name: "Smart Farming Tools",
    videos: [
      {
        title: "Drone Spraying",
        thumb: "https://mavdrones.com/wp-content/uploads/2025/04/Chemical-Spraying-for-better-Efficacy_a5-1300x508.webp",
        url: "https://youtu.be/NC0DEKZ0Wkk?si=UhfW6_7pIYcRIzjb"
      }
    ]
  }
];

export default function RuralPath() {
  return (
    <div className="container" style={{ paddingTop: 40 }}>
      <h1 className="h1" style={{ marginBottom: 20, color: "var(--text)" }}>
        Basic Skills
      </h1>

      {skills.map((s, i) => (
        <section key={i} style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--accent-400)",
            }}
          >
            {s.name}
          </h2>

          <div className="grid-3">
            {s.videos.map((v, j) => (
              <div key={j} className="card hover-card" style={{ transition: "0.25s" }}>
                <img
                  src={v.thumb}
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

                <p style={{ color: "var(--muted)", marginBottom: 8, fontSize: 14 }}>
                  Short training video.
                </p>

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
