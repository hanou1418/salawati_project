class salat{
    obtenirMoisEnArabe(numeroMois) {
        // On crée un tableau avec les noms des mois
        // L'index 0 est vide "" pour que le mois 1 corresponde à l'index 1
        const moisArabe = [
            "", 
            "يناير",   // Janvier
            "فبراير",  // Février
            "مارس",    // Mars
            "أبريل",   // Avril
            "مايو",    // Mai
            "يونيو",   // Juin
            "يوليو",   // Juillet
            "أغسطس",   // Août
            "سبتمبر",  // Septembre
            "أكتوبر",  // Octobre
            "نوفمبر",  // Novembre
            "ديسمبر"   // Décembre
        ];

        // On vérifie si le nombre est bien entre 1 et 12
        if (numeroMois >= 1 && numeroMois <= 12) {
            return moisArabe[numeroMois];
        } else {
            return "شهر غير صالح"; // "Mois non valide"
        }
    }
    constructor(yawm,mounth_arb_nbr,mounth_higri_letre,month_higri_nbr,year_hijri,Sunrise,Sunset,Fajr,Dhuhr,Asr,Maghrib,Isha,Lastthird){
        this.Fajr = Fajr;
        this.Sunrise = Sunrise;
        this.Dhuhr = Dhuhr;
        this.Asr = Asr;
        this.Sunset = Sunset;
        this.Maghrib = Maghrib;
        this.Isha = Isha;
        this.Lastthird = Lastthird;
        this.yawm=yawm;
        this.mounth_arb=this.obtenirMoisEnArabe(mounth_arb_nbr);
        this.mounth_higri_letre=mounth_higri_letre;
        this.month_higri_nbr=month_higri_nbr;
        this.year_hijri=year_hijri;
    }
    
    
}



// La fonction doit être "async" pour pouvoir utiliser "await"
async function get_data(day, mounth, year) {
    // On ajoute "return" devant axios pour que la fonction retourne la promesse
    return axios.get(`https://api.aladhan.com/v1/timingsByCity/${day}-${mounth}-${year}?city=Algiers&country=Algeria&method=19`)
    .then((response) => {
        const d = response.data.data;
        //console.log("Données reçues :", d); // Affiche les données reçues pour vérification
        // On crée l'objet et on le retourne
        return new salat(
            d.date.hijri.weekday.ar,
            mounth,
            d.date.hijri.month.ar,
            d.date.hijri.day,
            d.date.hijri.year,
            d.timings.Sunrise,
            d.timings.Sunset,
            d.timings.Fajr,
            d.timings.Dhuhr,
            d.timings.Asr,
            d.timings.Maghrib,
            d.timings.Isha,
            d.timings.Lastthird
        );
    })
    .catch((error) => {
        console.error("Erreur Axios :", error);
    });
}
//pour aubtenir la date de demin avec dayjs
function getDemainAvecDayJS(j, m, a) {
    // On crée la date (format ISO: YYYY-MM-DD)
    let dateInitiale = dayjs(`${a}-${m}-${j}`);
    
    // On ajoute 1 jour simplement
    let demain = dateInitiale.add(1, 'day');

    return {
        jour: demain.date(),
        mois: demain.month() + 1,
        annee: demain.year()
    };
}

// ... Garde la classe salat ...
// ... Garde ta fonction get_data ...
// ... Garde ta fonction getDemainAvecDayJS ...

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value !== undefined && value !== null ? value : '';
}

function setModeOnline() {
    const loader = document.getElementById('main-loader');
    const mincontainer = document.getElementById('mincontainer');
    if (loader) loader.style.display = 'none';
    if (mincontainer) mincontainer.style.display = 'block';
}

function setModeOffline() {
    const loader = document.getElementById('main-loader');
    const mincontainer = document.getElementById('mincontainer');
    if (loader) loader.style.display = 'block';
    if (mincontainer) mincontainer.style.display = 'none';
}

function remplirDonnees(aujourdhui, demain) {
    setText('arb_day', new Date().getDate());
    setText('month_arb', aujourdhui.mounth_arb);
    setText('arb_year', new Date().getFullYear());
    setText('month_higri_nbr', aujourdhui.month_higri_nbr);
    setText('month_higri_letre', aujourdhui.mounth_higri_letre);
    setText('year_hijri', aujourdhui.year_hijri);
    setText('sunrise', aujourdhui.Sunrise);
    setText('sunset', aujourdhui.Sunset);

    setText('fajr_today', aujourdhui.Fajr);
    setText('dhuhr_today', aujourdhui.Dhuhr);
    setText('asr_today', aujourdhui.Asr);
    setText('maghrib_today', aujourdhui.Maghrib);
    setText('isha_today', aujourdhui.Isha);
    setText('lastthird_today', aujourdhui.Lastthird);

    setText('fajr_tomorrow', demain.Fajr);
    setText('dhuhr_tomorrow', demain.Dhuhr);
    setText('asr_tomorrow', demain.Asr);
    setText('maghrib_tomorrow', demain.Maghrib);
    setText('isha_tomorrow', demain.Isha);
    setText('lastthird_tomorrow', demain.Lastthird);
    demarrerChrono(aujourdhui, demain);
}

let chronoInterval = null;

function parsePrayerTime(timeStr, offsetDays = 0) {
    const [h, m] = timeStr.split(':').map(Number);
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays, h, m, 0);
    return d;
}

function getNextPrayer(aujourdhui, demain) {
    const maintenant = new Date();
    const sequence = [
        { key: 'Fajr', label: 'الفجر' },
        { key: 'Dhuhr', label: 'الظهر' },
        { key: 'Asr', label: 'العصر' },
        { key: 'Maghrib', label: 'المغرب' },
        { key: 'Isha', label: 'العشاء' }
    ];

    for (const item of sequence) {
        const t = parsePrayerTime(aujourdhui[item.key]);
        if (t > maintenant) {
            return { name: item.label, time: t };
        }
    }

    // Si l'heure d'Isha est passée, on prend le fajr de demain
    const tFajrDemain = parsePrayerTime(demain.Fajr, 1);
    return { name: 'الفجر', time: tFajrDemain };
}

function formatDuration(ms) {
    if (ms < 0) ms = 0;
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')} : ${String(s).padStart(2, '0')}`;
}

function demarrerChrono(aujourdhui, demain) {
    if (chronoInterval) {
        clearInterval(chronoInterval);
    }

    const nameEl = document.getElementById('nextPrayerName');
    const countdownEl = document.getElementById('nextPrayerCountdown');

    function majChrono() {
        const next = getNextPrayer(aujourdhui, demain);
        const now = new Date();
        const reste = next.time - now;

        if (nameEl) nameEl.textContent = next.name;
        if (countdownEl) countdownEl.textContent = formatDuration(reste);

        if (reste <= 0) {
            // Recalculer si temps dépassé
            const temps = getNextPrayer(aujourdhui, demain);
            if (nameEl) nameEl.textContent = temps.name;
            if (countdownEl) countdownEl.textContent = formatDuration(Math.max(temps.time - new Date(), 0));
        }
    }

    majChrono();
    chronoInterval = setInterval(majChrono, 1000);
}

function animateNavTitle() {
    const title = document.getElementById('nav-title');
    if (!title || typeof gsap === 'undefined') {
        return;
    }

    const text = title.textContent.trim();
    if (!text) {
        return;
    }

    const chars = Array.from(text).map((char) => {
        if (char === ' ') {
            return '<span class="char">&nbsp;</span>';
        }
        return `<span class="char">${char}</span>`;
    });

    title.innerHTML = chars.join('');
    title.style.display = 'inline-block';

    gsap.from(title.querySelectorAll('.char'), {
        duration:2,
        opacity: 0,
        y: 25,
        ease: 'power3.out',
        stagger: 0.08
    });
}

/*async function loadHider() {
    try {
        const response = await fetch('./autre_pages/hider.html');
        if (!response.ok) {
            throw new Error(`Erreur chargement hider: ${response.status}`);
        }
        const data = await response.text();
        const hider = document.getElementById('hider');
        if (hider) {
            hider.innerHTML = data;
        }
    } catch (error) {
        console.warn(error);
    }
}*/

async function chargerHoraires() {
    if (!navigator.onLine) {
        console.warn('Offline : données non chargées');
        setModeOffline();
        return;
    }

    setModeOffline(); // afficher le loader avant la requête

    try {
        const today = new Date();
        const j = today.getDate();
        const m = today.getMonth() + 1;
        const a = today.getFullYear();
        const demainDate = getDemainAvecDayJS(j, m, a);

        const [resAuj, resDem] = await Promise.all([
            get_data(j, m, a),
            get_data(demainDate.jour, demainDate.mois, demainDate.annee)
        ]);

        if (resAuj && resDem) {
            remplirDonnees(resAuj, resDem);
            setModeOnline();
        } else {
            setModeOffline();
        }
    } catch (error) {
        console.error('Erreur :', error);
        setModeOffline();
    }
}
var icon=document.getElementById('ico_in');
icon.style='width:50px;height:50px';
window.addEventListener('online', () => {
    // une fois revenu en ligne, actualiser pour relancer proprement l'application
    window.location.reload();
});
window.addEventListener('offline', setModeOffline);

document.addEventListener('DOMContentLoaded', async () => {
    //await loadHider();
    animateNavTitle();
    chargerHoraires();
});
