import script from "@/data/scripts/uncertain_death.json";
import images from "@/data/images.json";
import Image from "next/image";
import Color, {ColorInstance, ColorLike} from "color";

type Script = Item[];

type Item = Character | Meta;

type Meta = {
    id: '_meta',
    name: string,
}

type Character = {
    id: string,
    name: string,
    team: Team,
    ability: string,
}

const accentColor: ColorInstance = Color('#162456');

type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';

function getGradient(baseColor: ColorLike) {
    try {
        const color = Color(baseColor);
        const lighter = color.lighten(0.8);
        return `linear-gradient(to top right, ${baseColor}, ${lighter})`;
    } catch {
        return `linear-gradient(to top right, ${baseColor}, ${baseColor})`;
    }
}

function findMeta(script: Script): Meta | undefined {
    return script.find((s) => s.id === "_meta") as Meta | undefined;
}

function findCharacters(script: Script): Character[] {
    return script.filter((s) => s.id !== "_meta") as Character[];
}

function findCharactersByTeam(script: Script, team: Team): Character[] {
    return findCharacters(script).filter((s) => s.team === team);
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
        .replace(/dämon|schergen|scherge|böse/gi, '<span class="text-red-800 font-medium">$&</span>');

    text = text.replace(/__PLACEHOLDER_(\d+)__/g, (_, i) => {
        return `<span class="font-semibold">${placeholders[i]}</span>`;
    });

    return text;
}

export default function Page() {
    const s = script as Script;
    const meta = findMeta(s);

    return (
        <>
            <NormalPage>
                <div className="w-16 h-full absolute top-0 left-0 -z-10"
                     style={{
                         backgroundImage: 'url(/assets/pattern.jpg)',
                         backgroundSize: '200px',
                         backgroundBlendMode: 'multiply',
                         backgroundColor: accentColor.toString()
                     }}>
                </div>
                <div className="flex-1">
                    <Header meta={meta}/>
                    <Section title="Bürger" characters={findCharactersByTeam(s, 'townsfolk')}/>
                    <Divider/>
                    <Section title="Außenseiter" characters={findCharactersByTeam(s, 'outsider')}/>
                    <Divider/>
                    <Section title="Schergen" characters={findCharactersByTeam(s, 'minion')}/>
                    <Divider/>
                    <Section title="Dämonen" characters={findCharactersByTeam(s, 'demon')}/>
                </div>
                <Footer/>
            </NormalPage>
            <FancyPage>
                <header className="text-center">
                    <h1
                        className="text-[100px] text-gold px-64 leading-none font-title text-shadow-lg"
                    >
                        {meta?.name || 'Unknown'}
                    </h1>
                </header>
            </FancyPage>
            <NormalPage>
                <div className="ml-auto w-16 h-full justify-center flex"
                     style={{
                         backgroundImage: 'url(/assets/pattern.jpg)',
                         backgroundSize: '200px',
                         backgroundBlendMode: 'multiply',
                         backgroundColor: accentColor.toString()
                     }}>
                    <h2 className="mt-16 text-2xl uppercase font-bold font-fancy [writing-mode:vertical-rl] [text-orientation:upright] text-gold">
                        Erste Nacht
                    </h2>
                </div>
            </NormalPage>
            <NormalPage>
                <div className="ml-auto w-16 h-full justify-center flex"
                     style={{
                         backgroundImage: 'url(/assets/pattern.jpg)',
                         backgroundSize: '200px',
                         backgroundBlendMode: 'multiply',
                         backgroundColor: accentColor.toString()
                     }}>
                    <h2 className="mt-16 text-2xl uppercase font-bold font-fancy [writing-mode:vertical-rl] [text-orientation:upright] text-gold">
                        Weitere Nächte
                    </h2>
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

function FancyPage({children}: { children: React.ReactNode }) {
    return (
        <main
            className="print-page w-[210mm] h-[297mm] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 text-xs text-black flex relative isolate overflow-hidden font-light items-center justify-center"
            style={{
                backgroundImage: 'url(/assets/pattern.jpg)',
                backgroundSize: '200px',
                backgroundBlendMode: 'multiply',
                backgroundColor: accentColor.toString()
            }}
        >
            {children}
        </main>
    );
}

function Header({meta}: { meta: Meta | undefined }) {
    return (
        <header className="ml-16 mt-8 text-center">
            <h1
                className="text-6xl mt-4 bg-clip-text text-transparent print:text-blue-950 print:bg-none font-title"
                style={{
                    backgroundImage: getGradient(accentColor)
                }}
            >
                {meta?.name || 'Unknown'}
            </h1>
        </header>
    );
}

function Footer() {
    return (
        <footer className="absolute bottom-0 left-0 right-0 text-center text-xs">
            <div className="ml-16 py-4">
                <p>* nicht in der ersten Nacht</p>
            </div>
        </footer>
    );
}

function Section({title, characters}: { title: string, characters: Character[] }) {
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

function Character({character}: { character: Character }) {
    const headlineTextColors: Record<Team, string> = {
        townsfolk: 'text-sky-800',
        outsider: 'text-sky-800',
        minion: 'text-red-800',
        demon: 'text-red-800',
        traveller: 'text-yellow-600',
        fabled: 'text-yellow-600',
        loric: 'text-green-600',
    }

    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-20 shrink-0">

                <img
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    src={images[character.id]}
                />

            </div>
            <div className="flex-1">
                <h3 className={classNames(
                    'font-bold text-sm font-text',
                    headlineTextColors[character.team]
                )}>{character.name}</h3>
                <p className="font-text" dangerouslySetInnerHTML={{__html: highlight(character.ability || '')}}></p>
            </div>
        </div>
    );
}
