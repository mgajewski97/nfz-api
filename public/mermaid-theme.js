    // Bubbles
    const layer = document.getElementById('bubblesLayer');
    const bc = [
        ['rgba(232,121,249,0.16)','rgba(167,139,250,0.07)'],
        ['rgba(167,139,250,0.18)','rgba(103,232,249,0.07)'],
        ['rgba(103,232,249,0.14)','rgba(52,211,153,0.06)'],
        ['rgba(255,255,255,0.5)', 'rgba(232,121,249,0.05)'],
        ['rgba(52,211,153,0.12)', 'rgba(103,232,249,0.06)'],
        ['rgba(248,187,255,0.2)', 'rgba(196,181,253,0.06)'],
    ];
    for (let i = 0; i < 28; i++) {
        const b = document.createElement('div');
        b.className = 'gb';
        const sz = 8 + Math.random() * 54;
        const [c1,c2] = bc[Math.floor(Math.random()*bc.length)];
        b.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;bottom:0;background:radial-gradient(circle at 36% 26%,rgba(255,255,255,0.88) 0%,${c1} 32%,${c2} 62%,transparent 80%);border:1px solid rgba(255,255,255,0.52);box-shadow:0 0 ${sz*0.32}px ${c1};animation-duration:${14+Math.random()*22}s;animation-delay:${-(Math.random()*38)}s;`;
        layer.appendChild(b);
    }
    // Tabs
    document.querySelectorAll('.tab').forEach(btn=>{
        btn.addEventListener('click',()=>{
            btn.closest('.tabs').querySelectorAll('.tab').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});
            btn.classList.add('active');btn.setAttribute('aria-selected','true');
        });
    });
    // Scroll reveal
    const els = document.querySelectorAll('.feat-card,.stat-card,.table-card');
    const obs = new IntersectionObserver(entries=>{
        entries.forEach(e=>{
            if(!e.isIntersecting) return;
            const i=[...els].indexOf(e.target)%4;
            e.target.style.cssText+='opacity:0;transform:translateY(20px);';
            setTimeout(()=>{e.target.style.transition='opacity .5s ease,transform .5s cubic-bezier(.34,1.56,.64,1)';e.target.style.opacity='1';e.target.style.transform='translateY(0)';},i*80);
            obs.unobserve(e.target);
        });
    },{threshold:0.08});
    els.forEach(el=>obs.observe(el));
