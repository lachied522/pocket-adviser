import NewsArea from "@/components/chat/news-area";

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