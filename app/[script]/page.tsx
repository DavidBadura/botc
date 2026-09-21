import nightSheet from "@/data/nightsheet.json";
import Image from "next/image";
import type { Metadata } from 'next';
import {useTranslations} from "next-intl";
import {notFound} from "next/navigation";
import {getTranslations} from "next-intl/server";
import {findRawMeta, iconPath, resolveJinxes, resolveScript} from "@/lib/script";
import {listScripts, loadScript} from "@/lib/scripts";
import {getTheme} from "@/lib/theme";
import type {Theme} from "@/lib/theme";
import type {Meta, Script, ScriptCharacter, ScriptJinx, Team} from "@/lib/script";

const teamTextColors: Record<Team, string> = {
    townsfolk: 'text-sky-800',
    outsider: 'text-sky-800',
    minion: 'text-red-800',
    demon: 'text-red-800',
    traveller: 'text-yellow-600',
    fabled: 'text-yellow-600',
    loric: 'text-green-600',
}

const teamBorderColors: Record<Team, string> = {
    townsfolk: 'border-sky-800',
    outsider: 'border-sky-800',
    minion: 'border-red-800',
    demon: 'border-red-800',
    traveller: 'border-yellow-600',
    fabled: 'border-yellow-600',
    loric: 'border-green-600',
}

function findMeta(script: Script): Meta | undefined {
    return script.find((s) => s.id === "_meta") as Meta | undefined;
}

function findCharacters(script: Script): ScriptCharacter[] {
    return script.filter((s) => s.id !== "_meta") as ScriptCharacter[];
}

function findCharactersByTeam(script: Script, team: Team): ScriptCharacter[] {
    return findCharacters(script).filter((s) => s.team === team);
}

type Night = 'first' | 'other';

const amber = {
    textColorClass: "text-amber-800",
    borderColorClass: "border-amber-800",
};

// the steps of the night sheet that are not characters
function specialSteps(night: Night): Record<string, StepData> {
    return {
        dusk: {
            image: "/assets/dusk-icon.png",
            title: "Abenddämmerung",
            ...amber,
            text: "Vergewissere dich, dass alle Augen geschlossen sind. Einige Reisende & Legenden handeln."
        },
        minioninfo: {
            image: "/assets/minioninfo.png",
            title: "Schergen Info",
            textColorClass: teamTextColors['minion'],
            borderColorClass: teamBorderColors['minion'],
            text: "Falls 7 oder mehr Spieler mitspielen, wecke alle Schergen: Zeige das *DIES IST DER DÄMON* Plättchen. Zeige auf den Dämon."
        },
        demoninfo: {
            image: "/assets/demoninfo.png",
            title: "Dämon Info",
            textColorClass: teamTextColors['demon'],
            borderColorClass: teamBorderColors['demon'],
            text: "Falls 7 oder mehr Spieler mitspielen, wecke den Dämon: Zeige das *DIES SIND DEINE SCHERGEN* Plättchen. Zeige auf alle Schergen. Zeige das *DIESE CHARAKTERE SIND NICHT IM SPIEL* Plättchen. Zeige 3 nicht im Spiel befindliche gute Charakterplättchen."
        },
        dawn: {
            image: "/assets/dawn-icon.png",
            title: "Morgendämmerung",
            ...amber,
            text: night === 'first'
                ? "Warte ein paar Sekunden. Dann wecke alle Spieler."
                : "Warte ein paar Sekunden. Dann wecke alle Spieler & sage sofort, wer gestorben ist."
        },
    };
}

function nightSteps(script: Script, night: Night): StepData[] {
    const order = night === 'first' ? nightSheet.firstNight : nightSheet.otherNight;
    const special = specialSteps(night);
    // travellers are not part of the night order
    const characters = findCharacters(script).filter((c) => c.team !== 'traveller');

    return order.flatMap((id): StepData[] => {
        if (id in special) {
            return [special[id]];
        }

        const character = characters.find((c) => c.id === id);
        if (!character) {
            return [];
        }

        return [{
            image: iconPath(character.id),
            title: character.name,
            textColorClass: teamTextColors[character.team],
            borderColorClass: teamBorderColors[character.team],
            text: character[night] || ''
        }];
    });
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

function highlight(text: string) {
    const placeholders: string[] = [];

    text = text.replace(/\[[^\]]+\]/g, (match) => {
        placeholders.push(match);
        return `__PLACEHOLDER_${placeholders.length - 1}__`;
    });

    text = text
        .replace(/bürger|außenseiter|guten|gute|gut/gi, '<span class="text-sky-800 font-medium">$&</span>')
        .replace(/dämon|schergen|scherge|bösen|böse/gi, '<span class="text-red-800 font-medium">$&</span>');

    text = text.replace(/__PLACEHOLDER_(\d+)__/g, (_, i) => {
        return `<span class="uppercase">${placeholders[i]}</span>`;
    });

    return text;
}

type Props = { params: Promise<{ script: string }> };

// only the scripts in data/scripts exist, everything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
    return listScripts().map((script) => ({script}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const raw = loadScript((await params).script);
    const meta = raw && findRawMeta(raw);

    return {
        title: meta?.name || 'Unknown'
    };
}

export default async function Page({params}: Props) {
    const slug = (await params).script;
    const raw = loadScript(slug);
    if (!raw) {
        notFound();
    }

    const s = resolveScript(raw, await getTranslations('roles'));
    const jinxes = resolveJinxes(s, await getTranslations('jinxes'));
    const meta = findMeta(s);
    const theme = getTheme(slug);

    return (
        <>
            <NormalPage>
                <div className="w-16 h-full"
                     style={theme.patternStyle}
                >
                </div>
                <div className="flex-1 -ml-16 flex flex-col">
                    <Header meta={meta} theme={theme}/>
                    <Section title="Bürger" characters={findCharactersByTeam(s, 'townsfolk')}/>
                    <Divider/>
                    <Section title="Außenseiter" characters={findCharactersByTeam(s, 'outsider')}/>
                    <Divider/>
                    <Section title="Schergen" characters={findCharactersByTeam(s, 'minion')}/>
                    <Divider/>
                    <Section title="Dämonen" characters={findCharactersByTeam(s, 'demon')}/>
                    <Footer/>
                </div>
            </NormalPage>
            <FancyPage theme={theme}>
                <header className="text-center">
                    <h1
                        className="text-[100px] text-gold px-64 leading-none font-title"
                    >
                        {meta?.name || 'Unknown'}
                    </h1>
                </header>
                <Jinxes jinxes={jinxes}/>
            </FancyPage>
            <NormalPage>
                <div className="flex w-full relative">
                    <div className="flex-1 flex flex-col py-4">
                        {nightSteps(s, 'first').map((stepData) => (<Step key={stepData.title} stepData={stepData}/>))}
                        <FooterLogo meta={meta} theme={theme}/>
                    </div>
                    <div className="w-16 h-full justify-center flex"
                         style={theme.patternStyle}>
                        <h2 className="mt-16 text-2xl uppercase font-bold font-fancy [writing-mode:vertical-rl] [text-orientation:upright] text-gold">
                            Erste Nacht
                        </h2>
                    </div>
                </div>
            </NormalPage>
            <NormalPage>
                <div className="flex w-full">
                    <div className="flex flex-col flex-1 py-4">
                        {nightSteps(s, 'other').map((stepData) => (<Step key={stepData.title} stepData={stepData}/>))}
                        <FooterLogo meta={meta} theme={theme}/>
                    </div>
                    <div className="w-16 h-full justify-center flex"
                         style={theme.patternStyle}>
                        <h2 className="mt-16 text-2xl uppercase font-bold font-fancy [writing-mode:vertical-rl] [text-orientation:upright] text-gold">
                            Weitere Nächte
                        </h2>
                    </div>
                </div>
            </NormalPage>
        </>
    );
}

function NormalPage({children}: { children: React.ReactNode }) {
    return (
        <main
            className="print-page w-[210mm] h-[297mm] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 text-xs text-black flex relative isolate overflow-hidden font-light"
            style={{backgroundImage: 'url(/assets/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            {children}
        </main>
    );
}

function FancyPage({children, theme}: { children: React.ReactNode, theme: Theme }) {
    return (
        <main
            className="print-page w-[210mm] h-[297mm] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 text-xs text-black flex relative isolate overflow-hidden font-light items-center justify-center"
            style={theme.patternStyle}
        >
            {children}
        </main>
    );
}

function Header({meta, theme}: { meta: Meta | undefined, theme: Theme }) {
    return (
        <header className="ml-16 mt-8 text-center">
            <img
                src={`/api/${theme.accentColor.hex().slice(1)}/title/${encodeURIComponent(meta?.name || 'Unknown')}`}
                alt={meta?.name || 'Unknown'}
                className="h-24 mx-auto"
            />
        </header>
    );
}

function Footer() {
    return (
        <footer className="flex-1 flex items-end justify-center">
            <div className="ml-16 py-4 text-center">
                <p>*nicht in der ersten Nacht</p>
                <p className="text-gray-600">&copy; David Badura</p>
            </div>
        </footer>
    );
}

function FooterLogo({meta, theme}: { meta: Meta | undefined, theme: Theme }) {
    if (!meta) return null;

    return (
        <footer className="flex-1 self-end flex items-end justify-center">
            <img
                src={`/api/${theme.accentColor.hex().slice(1)}/title/${encodeURIComponent(meta?.name || 'Unknown')}`}
                alt={meta?.name || 'Unknown'}
                className="h-8"
            />
        </footer>
    );
}

function Section({title, characters}: { title: string, characters: ScriptCharacter[] }) {
    return (
        <section className="flex relative">
            <div className="w-16 shrink-0 flex items-center justify-center">
                <h2 className="uppercase font-bold font-fancy [writing-mode:vertical-rl] [text-orientation:upright] text-gold">
                    {title}
                </h2>
            </div>
            <div className="grid grid-cols-2 flex-1 px-4">
                {characters.map((character) => (
                    <Character key={character.id} character={character}/>
                ))}
            </div>
        </section>
    );
}

function Jinxes({jinxes}: { jinxes: ScriptJinx[] }) {
    if (jinxes.length === 0) return null;

    return (
        <section
            className="absolute inset-x-16 bottom-16 rounded-sm px-6 py-4 shadow-lg"
            style={{backgroundImage: 'url(/assets/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <h2 className="mb-2 text-center uppercase font-bold font-fancy text-gold">Jinxes</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {jinxes.map((jinx) => (
                    <div key={jinx.characters.map((c) => c.id).join('-')} className="flex items-center gap-2">
                        <div className="flex w-20 shrink-0">
                            {jinx.characters.map((character) => (
                                <img
                                    key={character.id}
                                    className="w-10 h-10 object-contain"
                                    src={iconPath(character.id)}
                                    alt={character.name}
                                />
                            ))}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold font-text">
                                <span className={teamTextColors[jinx.characters[0].team]}>{jinx.characters[0].name}</span>
                                {' & '}
                                <span className={teamTextColors[jinx.characters[1].team]}>{jinx.characters[1].name}</span>
                            </h3>
                            <p className="font-text" dangerouslySetInnerHTML={{__html: highlight(jinx.text)}}></p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Divider() {
    return (
        <div className="h-1 px-4 my-2">
            <Image
                className="mix-blend-soft-light w-full h-1"
                src="/assets/divider.png"
                alt="divider"
                width={2225} height={32}
            />
        </div>
    );
}

function Character({character}: { character: ScriptCharacter }) {
    'use client'

    const t = useTranslations();

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-20 shrink-0">
                <img
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    src={iconPath(character.id)}
                />

            </div>
            <div className="flex-1">
                <h3 className={classNames(
                    'font-bold text-sm font-text',
                    teamTextColors[character.team]
                )}>{character.name} {character.name !== character.englishName ? `(${character.englishName})` : ''}</h3>
                <p className="font-text" dangerouslySetInnerHTML={{__html: highlight(character.ability || '')}}></p>
            </div>
        </div>
    );
}

type StepData = {
    image: string,
    title: string,
    textColorClass: string,
    borderColorClass: string,
    text: string,
};

function Step({stepData}: { stepData: StepData }) {
    const parsedText = stepData.text
        .replace(/\*([^*]+)\*/g, '<span class="font-bold">$1</span>')
        .replace(/:reminder:/g, '<img src="/assets/reminder.png" alt="Reminder" class="inline-block w-3 h-3" />');

    return (
        <div className="flex gap-4 w-full items-center px-4">
            <div className="flex w-16 h-16 shrink-0">
                <img
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    src={stepData.image}
                    alt={stepData.title}
                />
            </div>
            <h3 className={classNames(
                'flex font-bold text-sm font-text text-right w-32',
                stepData.textColorClass,
            )}>{stepData.title}</h3>
            <div className={classNames(
                'flex-1 flex items-center border-l-2 pl-4 min-h-12',
                stepData.borderColorClass
            )}>
                <p
                    className="font-text"
                    dangerouslySetInnerHTML={{__html: parsedText}}>
                </p>
            </div>
        </div>
    );
}

