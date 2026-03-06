import script from "@/scripts/uncertain_death.json";
import Image from "next/image";

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

type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';

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

    return (
        <main
            className="w-[210mm] h-[297mm] mx-auto my-8 bg-white shadow-lg print:shadow-none print:m-0 text-xs text-black flex relative isolate font-light"
            style={{backgroundImage: 'url(/assets/bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <div className="w-16 h-full absolute top-0 left-0 z-0"
                 style={{
                     backgroundImage: 'url(/assets/pattern.jpg)',
                     backgroundSize: '400%',
                     backgroundBlendMode: 'multiply',
                     backgroundColor: 'rgb(59 7 100)'
                 }}>
            </div>
            <div className="flex-1">
                <Header script={s}/>
                <Section title="Bürger" characters={findCharactersByTeam(s, 'townsfolk')}/>
                <Divider/>
                <Section title="Außenseiter" characters={findCharactersByTeam(s, 'outsider')}/>
                <Divider/>
                <Section title="Schergen" characters={findCharactersByTeam(s, 'minion')}/>
                <Divider/>
                <Section title="Dämonen" characters={findCharactersByTeam(s, 'demon')}/>
            </div>
            <Footer/>
        </main>
    );
}

function Header({script}: { script: Script }) {
    const meta = findMeta(script);

    return (
        <header className="ml-16 text-center">
            <h1
                className="text-6xl mt-4 bg-linear-to-tr from-purple-950 to-purple-800 bg-clip-text text-transparent print:text-purple-950 print:bg-none"
                style={{fontFamily: 'LHF Unlovable, serif'}}
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
        <section className="flex">
            <div className="w-16 shrink-0 flex items-center justify-center">
                <h2 className="rotate-0 [writing-mode:vertical-rl] [text-orientation:upright] text-yellow-100">
                    {title}
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1 px-4">
                {characters.map((character) => (
                    <Character key={character.id} character={character}/>
                ))}
            </div>
        </section>
    );
}

function Divider() {
    return (
        <div className="h-1 px-4 my-4">
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
                <Image
                    src={`/assets/${character.id}.png`}
                    alt={character.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                />
            </div>
            <div className="flex-1">
                <h3 className={classNames(
                    'font-bold text-sm',
                    headlineTextColors[character.team]
                )}>{character.name}</h3>
                <p dangerouslySetInnerHTML={{__html: highlight(character.ability || '')}}></p>
            </div>
        </div>
    );
}