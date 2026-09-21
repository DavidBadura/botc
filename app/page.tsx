import Link from "next/link";
import {findRawMeta} from "@/lib/script";
import {listScripts, loadScript} from "@/lib/scripts";

export default function Home() {
    const scripts = listScripts().map((slug) => {
        const raw = loadScript(slug);

        return {slug, name: (raw && findRawMeta(raw)?.name) || slug};
    });

    return (
        <main className="max-w-xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Blood on the Clocktower Scripts</h1>
            <ul className="list-disc pl-6 space-y-1">
                {scripts.map(({slug, name}) => (
                    <li key={slug}>
                        <Link href={`/${slug}`} className="underline">{name}</Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
