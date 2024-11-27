import NewsArea from "./components/news-area";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NewsArea />
            {children}
        </>
    )
}