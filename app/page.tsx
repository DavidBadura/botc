import Link from "next/link";
import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {findRawMeta, iconPath, resolveScript} from "@/lib/script";
import type {ScriptCharacter, Team} from "@/lib/script";
import {listScripts, loadScript} from "@/lib/scripts";
import {getTheme} from "@/lib/theme";

export const metadata: Metadata = {
    title: 'Scripts',
};

const MAX_ICONS = 5;

const teamLabels: { team: Team, label: string, className: string }[] = [
    {team: 'townsfolk', label: 'Bürger', className: 'text-sky-800'},
    {team: 'outsider', label: 'Außenseiter', className: 'text-sky-600'},
    {team: 'minion', label: 'Schergen', className: 'text-red-700'},
    {team: 'demon', label: 'Dämonen', className: 'text-red-900'},
];

export default async function Home() {
    const t = await getTranslations('roles');

    const scripts = listScripts().flatMap((slug) => {
        const raw = loadScript(slug);
        if (!raw) {
            return [];
        }

        const resolved = resolveScript(raw, t);
        const meta = findRawMeta(raw);
        const characters = resolved.filter((item): item is ScriptCharacter => item.id !== '_meta');

        return [{slug, name: meta?.name || slug, author: meta?.author, characters, theme: getTheme(slug)}];
    });

    return (
        <main className="min-h-screen px-6 py-16 text-white">
            <header className="text-center mb-14">
                <p className="font-fancy uppercase tracking-[0.3em] text-gold text-sm">Blood on the Clocktower</p>
                <h1 className="font-title text-gold text-7xl leading-tight mt-2">Scripts</h1>
                <div className="flex items-center justify-center gap-3 mt-4 text-gold/60" aria-hidden>
                    <span className="h-px w-24 bg-gradient-to-r from-transparent to-gold/60"/>
                    <span className="text-xs">&#9670;</span>
                    <span className="h-px w-24 bg-gradient-to-l from-transparent to-gold/60"/>
                </div>
            </header>

            <ul className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8">
                {scripts.map(({slug, name, author, characters, theme}) => (
                    <li key={slug} className="w-full sm:w-96">
                        <Link
                            href={`/${slug}`}
                            className="group flex h-full overflow-hidden rounded-sm text-black shadow-xl shadow-black/50 ring-1 ring-gold/40 transition duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-gold hover:shadow-2xl"
                            style={{backgroundImage: 'url(/assets/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}
                        >
                            <div className="w-10 shrink-0" style={theme.patternStyle}/>
                            <div className="flex flex-1 flex-col gap-4 p-5">
                                <div>
                                    <h2
                                        className="font-title text-3xl leading-tight"
                                        style={{color: theme.accentColor.hex()}}
                                    >
                                        {name}
                                    </h2>
                                    {author && <p className="font-text text-sm text-gray-600 mt-1">von {author}</p>}
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {characters.slice(0, MAX_ICONS).map((character) => (
                                        <img
                                            key={character.id}
                                            src={iconPath(character.id)}
                                            alt={character.name}
                                            title={character.name}
                                            width={36}
                                            height={36}
                                            loading="lazy"
                                            className="h-9 w-9 object-contain"
                                        />
                                    ))}
                                    {characters.length > MAX_ICONS && (
                                        <span className="flex h-9 items-center px-1 font-text text-sm text-gray-600">
                                            +{characters.length - MAX_ICONS}
                                        </span>
                                    )}
                                </div>

                                <ul className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1 border-t border-black/15 pt-3 font-text text-sm">
                                    {teamLabels.map(({team, label, className}) => {
                                        const count = characters.filter((character) => character.team === team).length;

                                        return count > 0 && (
                                            <li key={team} className={className}>
                                                <span className="font-bold">{count}</span> {label}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}
