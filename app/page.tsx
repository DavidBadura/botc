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
    first?: string,
    other?: string,
}

const accentColor: ColorInstance = Color('#162456');

type Team = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled' | 'loric';

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

const firstNightOrder = [
    "dusk",
    "angel",
    "budhist",
    "toymaker",
    "stormcatcher",
    "wraith",
    "lordoftyphon",
    "kazali",
    "apprentice",
    "barista",
    "bureaucrate",
    "thief",
    "boffin",
    "philosopher",
    "alchemist",
    "poppygrower",
    "yaggababble",
    "magician",
    "minioninfo",
    "snitch",
    "lunatic",
    "summoner",
    "demon info & bluffs",
    "king",
    "sailor",
    "marionette",
    "engineer",
    "preacher",
    "lilmonsta",
    "lleech",
    "xaan",
    "poisoner",
    "widow",
    "courtier",
    "wizard",
    "snakecharmer",
    "godfather",
    "organgrinder",
    "devilsadvocate",
    "eviltwin",
    "witch",
    "cerenovus",
    "fearmonger",
    "harpy",
    "mezepheles",
    "pukka",
    "pixie",
    "huntsman",
    "damsel",
    "amnesiac",
    "washerwoman",
    "librarian",
    "investigator",
    "chef",
    "empath",
    "fortuneteller",
    "butler",
    "grandmother",
    "clockmaker",
    "dreamer",
    "seamstress",
    "steward",
    "knight",
    "noble",
    "balloonist",
    "shugenja",
    "villageidiot",
    "bountyhunter",
    "nightwatchman",
    "cultleader",
    "spy",
    "ogre",
    "highpriestess",
    "general",
    "chambermaid",
    "mathematician",
    "dawn",
    "leviathan",
    "vizier"
];

const otherNightOrder = [
    "dusk",
    "duchess",
    "toymaker",
    "wraith",
    "barista",
    "bonecollector",
    "bureaucrate",
    "harlot",
    "thief",
    "philosopher",
    "poppygrower",
    "sailor",
    "engineer",
    "preacher",
    "xaan",
    "poisoner",
    "courtier",
    "inkeeper",
    "wizard",
    "gambler",
    "acrobat",
    "snakecharmer",
    "monk",
    "organgrinder",
    "devilsadvocate",
    "witch",
    "cerenovus",
    "pit-hag",
    "fearmonger",
    "harpy",
    "mezepheles",
    "scarletwoman",
    "summoner",
    "lunatic",
    "exorcist",
    "lycanthrope",
    "legion",
    "imp",
    "zombuul",
    "pukka",
    "shabaloth",
    "po",
    "fanggu",
    "nodashii",
    "vortox",
    "lordoftyphon",
    "vigormortis",
    "ojo",
    "alhadikhia",
    "lleech",
    "lilmonsta",
    "yaggababble",
    "kazali",
    "assassin",
    "godfather",
    "gossip",
    "hatter",
    "barber",
    "sweetheart",
    "plaguedoctor",
    "sage",
    "banshee",
    "professor",
    "choirboy",
    "huntsman",
    "damsel",
    "amnesiac",
    "farmer",
    "tinker",
    "moonchild",
    "grandmother",
    "tor",
    "ravenkeeper",
    "empath",
    "fortuneteller",
    "undertaker",
    "dreamer",
    "flowergirl",
    "towncrier",
    "oracle",
    "seamstress",
    "juggler",
    "balloonist",
    "villageidiot",
    "king",
    "bountyhunter",
    "nightwatchman",
    "cultleader",
    "butler",
    "spy",
    "highpriestess",
    "general",
    "chambermaid",
    "mathematician",
    "dawn",
    "leviathan"
];


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

function firstNight(script: Script): StepData[] {
    const result: StepData[] = [];

    firstNightOrder.forEach((id) => {
        if (id === "dusk") {
            result.push({
                image: "/assets/dusk-icon.png",
                title: "Abenddämmerung",
                textColorClass: "text-amber-800",
                borderColorClass: "border-amber-800",
                text: "Vergewissere dich, dass alle Augen geschlossen sind. Einige Reisende & Legenden handeln."
            });

            return;
        }

        if (id === "minion info") {
            result.push({
                image: "/assets/minioninfo.png",
                title: "Schergen Info",
                textColorClass: teamTextColors['minion'],
                borderColorClass: teamBorderColors['minion'],
                text: "Falls 7 oder mehr Spieler mitspielen, wecke alle Schergen: Zeige das *DIES IST DER DÄMON* Plättchen. Zeige auf den Dämon."
            });

            return;
        }

        if (id === "demon info & bluffs") {
            result.push({
                image: "/assets/demoninfo.png",
                title: "Dämon Info",
                textColorClass: teamTextColors['demon'],
                borderColorClass: teamBorderColors['demon'],
                text: "Falls 7 oder mehr Spieler mitspielen, wecke den Dämon: Zeige das *DIES SIND DEINE SCHERGEN* Plättchen. Zeige auf alle Schergen. Zeige das *DIESE CHARAKTERE SIND NICHT IM SPIEL* Plättchen. Zeige 3 nicht im Spiel befindliche gute Charakterplättchen."
            });

            return;
        }

        if (id === "dawn") {
            result.push({
                image: "/assets/dawn-icon.png",
                title: "Morgendämmerung",
                textColorClass: "text-amber-800",
                borderColorClass: "border-amber-800",
                text: "Warte ein paar Sekunden. Dann wecke alle Spieler."
            });
        }


        const character = findCharacters(script).find((s) => s.id === id);
        if (character) {
            result.push({
                image: images[character.id],
                title: character.name,
                textColorClass: teamTextColors[character.team],
                borderColorClass: teamBorderColors[character.team],
                text: character.first || ''
            });
        }
    });

    return result;
}

function otherNight(script: Script): StepData[] {
    const result: StepData[] = [];

    otherNightOrder.forEach((id) => {
        if (id === "dusk") {
            result.push({
                image: "/assets/dusk-icon.png",
                title: "Abenddämmerung",
                textColorClass: "text-amber-800",
                borderColorClass: "border-amber-800",
                text: "Vergewissere dich, dass alle Augen geschlossen sind. Einige Reisende & Legenden handeln."
            });

            return;
        }

        if (id === "dawn") {
            result.push({
                image: "/assets/dawn-icon.png",
                title: "Morgendämmerung",
                textColorClass: "text-amber-800",
                borderColorClass: "border-amber-800",
                text: "Warte ein paar Sekunden. Dann wecke alle Spieler & sage sofort, wer gestorben ist."
            });
        }

        const character = findCharacters(script).find((s) => s.id === id);
        if (character) {
            result.push({
                image: images[character.id],
                title: character.name,
                textColorClass: teamTextColors[character.team],
                borderColorClass: teamBorderColors[character.team],
                text: character.other || ''
            });
        }
    });

    return result;
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
                        className="text-[100px] text-gold px-64 leading-none font-title"
                    >
                        {meta?.name || 'Unknown'}
                    </h1>
                </header>
            </FancyPage>
            <NormalPage>
                <div className="flex w-full">
                    <div className="flex-1 flex flex-col py-4">
                        {firstNight(s).map((stepData) => (<Step stepData={stepData}/>))}
                        <FooterLogo meta={meta}/>
                    </div>
                    <div className="w-16 h-full justify-center flex"
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
                </div>
            </NormalPage>
            <NormalPage>
                <div className="flex w-full">
                    <div className="flex flex-col flex-1 py-4">
                        {otherNight(s).map((stepData) => (<Step stepData={stepData}/>))}
                        <FooterLogo meta={meta}/>
                    </div>
                    <div className="w-16 h-full justify-center flex"
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
                <p>*nicht in der ersten Nacht</p>
                <p className="text-gray-600">&copy; David Badura</p>
            </div>
        </footer>
    );
}

function FooterLogo({meta}: { meta: Meta | undefined }) {
    if (!meta) return null;

    return (
        <footer className="flex-1 self-end flex items-end justify-center px-8">
                <span
                    className="text-2xl bg-clip-text text-transparent print:text-blue-950 print:bg-none font-title"
                    style={{
                        backgroundImage: getGradient(accentColor)
                    }}
                >
                    {meta.name}
                </span>
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
                    teamTextColors[character.team]
                )}>{character.name}</h3>
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

