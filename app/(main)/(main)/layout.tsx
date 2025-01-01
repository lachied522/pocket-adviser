import NewsArea from "./chat/components/news-area";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
            <NewsArea />
        </>
    )
}