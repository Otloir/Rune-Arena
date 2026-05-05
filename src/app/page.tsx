import Image from "next/image";

export default function Home() {
  return (
    <div>
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          style={{ filter: "invert(1)" }}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.875rem", fontWeight: 600 }}>
            To get started, edit the page.tsx file.
          </h1>
          <p style={{ fontSize: "1.125rem", lineHeight: 1.8, color: "#666" }}>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              style={{ fontWeight: 500 }}
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              style={{ fontWeight: 500 }}
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          <a
            style={{
              display: "flex",
              height: "48px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              borderRadius: "9999px",
              backgroundColor: "#171717",
              color: "#ffffff",
              cursor: "pointer",
            }}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              style={{ filter: "invert(1)" }}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            style={{
              display: "flex",
              height: "48px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              padding: "0 1.25rem",
              cursor: "pointer",
            }}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
