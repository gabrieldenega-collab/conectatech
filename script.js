const AIRTABLE_BASE_ID = "applqvqURG7GwrLtc";
const AIRTABLE_TOKEN = "patf2hkzs3fDgSu5m.10d42d3500177fbe4bf0215e617995a0be2c37c95fb1e42f8186d26f25e98a60";

const AIRTABLE_API = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
};

let currentUser = null;
let currentEventoId = null;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function escapeAirtableFormula(value) {
    return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function buildFilterUrl(baseUrl, formula) {
    return `${baseUrl}?filterByFormula=${encodeURIComponent(formula)}`;
}

function init() {
    loadUserFromStorage();
    setupNavigation();
    setupAuthForms();
    updateUIForAuth();
    
    if (window.location.hash) {
        const page = window.location.hash.substring(1);
        navigateTo(page);
    } else {
        loadEventos();
    }
}

function loadUserFromStorage() {
    const userData = localStorage.getItem('conectatech_user');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('conectatech_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('conectatech_user');
    }
}

function updateUIForAuth() {
    const authLinks = document.querySelectorAll('.auth-only');
    const guestLinks = document.querySelectorAll('.guest-only');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        authLinks.forEach(el => el.style.display = '');
        guestLinks.forEach(el => el.style.display = 'none');
        if (userInfo) {
            userInfo.textContent = `Olá, ${currentUser.nome}`;
        }
    } else {
        authLinks.forEach(el => el.style.display = 'none');
        guestLinks.forEach(el => el.style.display = '');
        if (userInfo) {
            userInfo.textContent = '';
        }
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });

    const authFooterLinks = document.querySelectorAll('.auth-footer a');
    authFooterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });

    const emptyStateLinks = document.querySelectorAll('.empty-state a');
    emptyStateLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            if (page) {
                navigateTo(page);
            }
        });
    });

    document.getElementById('btnBackFromSessoes')?.addEventListener('click', () => {
        navigateTo('eventos');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    window.location.hash = page;

    switch(page) {
        case 'eventos':
            loadEventos();
            break;
        case 'meus-eventos':
            if (currentUser) loadMeusEventos();
            break;
        case 'minhas-sessoes':
            if (currentUser) loadMinhasSessoes();
            break;
    }
}

function setupAuthForms() {
    const registoForm = document.getElementById('registoForm');
    registoForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegisto();
    });

    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
}

async function handleRegisto() {
    const nome = document.getElementById('registoNome').value;
    const email = document.getElementById('registoEmail').value;
    const password = document.getElementById('registoPassword').value;
    const telefone = document.getElementById('registoTelefone').value;

    const errorDiv = document.getElementById('registoError');
    const successDiv = document.getElementById('registoSuccess');
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
        errorDiv.textContent = 'Erro: Configure AIRTABLE_BASE_ID e AIRTABLE_TOKEN no script.js';
        errorDiv.classList.add('show');
        return;
    }

    try {
        const checkResponse = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/utilizadores`, `{email}='${escapeAirtableFormula(email)}'`),
            { headers }
        );
        const checkData = await checkResponse.json();

        if (checkData.records && checkData.records.length > 0) {
            errorDiv.textContent = 'Este email já está registado.';
            errorDiv.classList.add('show');
            return;
        }

        const response = await fetch(`${AIRTABLE_API}/utilizadores`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    nome,
                    email,
                    password,
                    telefone: telefone || ''
                }
            })
        });

        if (response.ok) {
            successDiv.textContent = 'Conta criada com sucesso! Redirecionando para login...';
            successDiv.classList.add('show');
            document.getElementById('registoForm').reset();
            setTimeout(() => navigateTo('login'), 2000);
        } else {
            const error = await response.json();
            errorDiv.textContent = 'Erro ao criar conta: ' + (error.error?.message || 'Erro desconhecido');
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Erro de conexão: ' + error.message;
        errorDiv.classList.add('show');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const errorDiv = document.getElementById('loginError');
    errorDiv.classList.remove('show');

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
        errorDiv.textContent = 'Erro: Configure AIRTABLE_BASE_ID e AIRTABLE_TOKEN no script.js';
        errorDiv.classList.add('show');
        return;
    }

    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/utilizadores`, `AND({email}='${escapeAirtableFormula(email)}',{password}='${escapeAirtableFormula(password)}')`),
            { headers }
        );
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            const user = data.records[0];
            currentUser = {
                id: user.id,
                nome: user.fields.nome,
                email: user.fields.email
            };
            saveUserToStorage();
            updateUIForAuth();
            navigateTo('eventos');
        } else {
            errorDiv.textContent = 'Email ou senha incorretos.';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        errorDiv.textContent = 'Erro de conexão: ' + error.message;
        errorDiv.classList.add('show');
    }
}

function logout() {
    currentUser = null;
    saveUserToStorage();
    updateUIForAuth();
    navigateTo('login');
}

async function loadEventos() {
    const loadingDiv = document.getElementById('loadingEventos');
    const gridDiv = document.getElementById('eventosGrid');
    
    loadingDiv.style.display = 'block';
    gridDiv.innerHTML = '';

    if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) {
        gridDiv.innerHTML = '<p style="color: var(--error-color);">Configure AIRTABLE_BASE_ID e AIRTABLE_TOKEN no script.js</p>';
        loadingDiv.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${AIRTABLE_API}/eventos`, { headers });
        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.records && data.records.length > 0) {
            let userEventos = [];
            if (currentUser) {
                userEventos = await getUserEventos();
            }

            data.records.forEach(record => {
                const evento = record.fields;
                const isInscrito = userEventos.includes(record.id);
                gridDiv.innerHTML += createEventoCard(record.id, evento, isInscrito);
            });

            document.querySelectorAll('.btn-inscrever-evento').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventoId = e.target.getAttribute('data-evento-id');
                    inscreverEvento(eventoId);
                });
            });

            document.querySelectorAll('.btn-cancelar-evento').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventoId = e.target.getAttribute('data-evento-id');
                    cancelarInscricaoEvento(eventoId);
                });
            });

            document.querySelectorAll('.btn-ver-sessoes').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventoId = e.target.getAttribute('data-evento-id');
                    const eventoNome = e.target.getAttribute('data-evento-nome');
                    verSessoes(eventoId, eventoNome);
                });
            });
        } else {
            gridDiv.innerHTML = '<p>Nenhum evento disponível no momento.</p>';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        gridDiv.innerHTML = `<p style="color: var(--error-color);">Erro ao carregar eventos: ${error.message}</p>`;
    }
}

function createEventoCard(id, evento, isInscrito = false) {
    const inscritoClass = isInscrito ? 'inscrito' : '';
    const inscritoBadge = isInscrito ? '<span class="badge-inscrito">✓ Inscrito</span>' : '';
    
    return `
        <div class="event-card ${inscritoClass}">
            <h3>${escapeHtml(evento.nome) || 'Evento sem nome'}</h3>
            ${inscritoBadge}
            <div class="event-meta">
                <span class="meta-item">📅 ${escapeHtml(evento.data) || 'Data a definir'}</span>
                <span class="meta-item">📍 ${escapeHtml(evento.local) || 'Local a definir'}</span>
            </div>
            <p>${escapeHtml(evento.descricao) || 'Sem descrição'}</p>
            <div class="session-actions">
                <button class="btn-secondary btn-ver-sessoes" data-evento-id="${escapeHtml(id)}" data-evento-nome="${escapeHtml(evento.nome)}">
                    Ver Sessões
                </button>
                ${currentUser ? (isInscrito ? 
                    `<button class="btn-danger btn-cancelar-evento" data-evento-id="${escapeHtml(id)}">Cancelar Inscrição</button>` :
                    `<button class="btn-primary btn-inscrever-evento" data-evento-id="${escapeHtml(id)}">Inscrever-se</button>`) : 
                    ''}
            </div>
        </div>
    `;
}

async function getUserEventos() {
    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes`, `{utilizador_id}='${currentUser.id}'`),
            { headers }
        );
        const data = await response.json();
        return data.records ? data.records.map(r => r.fields.evento_id) : [];
    } catch (error) {
        return [];
    }
}

async function inscreverEvento(eventoId) {
    if (!currentUser) {
        alert('Faça login para se inscrever em eventos.');
        navigateTo('login');
        return;
    }

    try {
        const response = await fetch(`${AIRTABLE_API}/inscricoes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    utilizador_id: currentUser.id,
                    evento_id: eventoId
                }
            })
        });

        if (response.ok) {
            alert('Inscrição realizada com sucesso!');
            loadEventos();
        } else {
            const error = await response.json();
            alert('Erro ao inscrever: ' + (error.error?.message || 'Erro desconhecido'));
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

async function cancelarInscricaoEvento(eventoId) {
    if (!currentUser) return;

    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;

    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes`, `AND({utilizador_id}='${currentUser.id}',{evento_id}='${eventoId}')`),
            { headers }
        );
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            const inscricaoId = data.records[0].id;
            const deleteResponse = await fetch(`${AIRTABLE_API}/inscricoes/${inscricaoId}`, {
                method: 'DELETE',
                headers
            });

            if (deleteResponse.ok) {
                alert('Inscrição cancelada com sucesso!');
                loadEventos();
            } else {
                alert('Erro ao cancelar inscrição.');
            }
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

function verSessoes(eventoId, eventoNome) {
    currentEventoId = eventoId;
    document.getElementById('sessaoEventoTitulo').textContent = `Sessões - ${eventoNome}`;
    navigateTo('sessoes');
    loadSessoes(eventoId);
}

async function loadSessoes(eventoId) {
    const loadingDiv = document.getElementById('loadingSessoes');
    const gridDiv = document.getElementById('sessoesGrid');
    
    loadingDiv.style.display = 'block';
    gridDiv.innerHTML = '';

    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/sessoes`, `{evento_id}='${eventoId}'`),
            { headers }
        );
        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.records && data.records.length > 0) {
            let userSessoes = [];
            if (currentUser) {
                userSessoes = await getUserSessoes();
            }

            data.records.forEach(record => {
                const sessao = record.fields;
                const isInscrito = userSessoes.includes(record.id);
                gridDiv.innerHTML += createSessaoCard(record.id, sessao, isInscrito);
            });

            document.querySelectorAll('.btn-inscrever-sessao').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sessaoId = e.target.getAttribute('data-sessao-id');
                    inscreverSessao(sessaoId);
                });
            });

            document.querySelectorAll('.btn-cancelar-sessao').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sessaoId = e.target.getAttribute('data-sessao-id');
                    cancelarInscricaoSessao(sessaoId);
                });
            });
        } else {
            gridDiv.innerHTML = '<p>Nenhuma sessão disponível para este evento.</p>';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        gridDiv.innerHTML = `<p style="color: var(--error-color);">Erro ao carregar sessões: ${error.message}</p>`;
    }
}

function createSessaoCard(id, sessao, isInscrito = false) {
    const inscritoClass = isInscrito ? 'inscrito' : '';
    const inscritoBadge = isInscrito ? '<span class="badge-inscrito">✓ Inscrito</span>' : '';
    
    return `
        <div class="session-card ${inscritoClass}">
            <h3>${escapeHtml(sessao.titulo) || 'Sessão sem título'}</h3>
            ${inscritoBadge}
            <div class="session-info">
                <div class="info-item"><strong>Palestrante:</strong> ${escapeHtml(sessao.palestrante) || 'A definir'}</div>
                <div class="info-item"><strong>Horário:</strong> ${escapeHtml(sessao.horario) || 'A definir'}</div>
                <div class="info-item"><strong>Sala:</strong> ${escapeHtml(sessao.sala) || 'A definir'}</div>
            </div>
            <p>${escapeHtml(sessao.descricao) || 'Sem descrição'}</p>
            ${currentUser ? (isInscrito ? 
                `<button class="btn-danger btn-cancelar-sessao" data-sessao-id="${escapeHtml(id)}">Cancelar Inscrição</button>` :
                `<button class="btn-primary btn-inscrever-sessao" data-sessao-id="${escapeHtml(id)}">Inscrever-se</button>`) : 
                ''}
        </div>
    `;
}

async function getUserSessoes() {
    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes_sessoes`, `{utilizador_id}='${currentUser.id}'`),
            { headers }
        );
        const data = await response.json();
        return data.records ? data.records.map(r => r.fields.sessao_id) : [];
    } catch (error) {
        return [];
    }
}

async function inscreverSessao(sessaoId) {
    if (!currentUser) {
        alert('Faça login para se inscrever em sessões.');
        navigateTo('login');
        return;
    }

    try {
        const response = await fetch(`${AIRTABLE_API}/inscricoes_sessoes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                fields: {
                    utilizador_id: currentUser.id,
                    sessao_id: sessaoId
                }
            })
        });

        if (response.ok) {
            alert('Inscrição na sessão realizada com sucesso!');
            loadSessoes(currentEventoId);
        } else {
            const error = await response.json();
            alert('Erro ao inscrever: ' + (error.error?.message || 'Erro desconhecido'));
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

async function cancelarInscricaoSessao(sessaoId) {
    if (!currentUser) return;

    if (!confirm('Tem certeza que deseja cancelar esta inscrição?')) return;

    try {
        const response = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes_sessoes`, `AND({utilizador_id}='${currentUser.id}',{sessao_id}='${sessaoId}')`),
            { headers }
        );
        const data = await response.json();

        if (data.records && data.records.length > 0) {
            const inscricaoId = data.records[0].id;
            const deleteResponse = await fetch(`${AIRTABLE_API}/inscricoes_sessoes/${inscricaoId}`, {
                method: 'DELETE',
                headers
            });

            if (deleteResponse.ok) {
                alert('Inscrição cancelada com sucesso!');
                loadSessoes(currentEventoId);
            } else {
                alert('Erro ao cancelar inscrição.');
            }
        }
    } catch (error) {
        alert('Erro de conexão: ' + error.message);
    }
}

async function loadMeusEventos() {
    const loadingDiv = document.getElementById('loadingMeusEventos');
    const gridDiv = document.getElementById('meusEventosGrid');
    const noEventosDiv = document.getElementById('noEventos');
    
    loadingDiv.style.display = 'block';
    gridDiv.innerHTML = '';
    noEventosDiv.style.display = 'none';

    try {
        const inscricoesResponse = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes`, `{utilizador_id}='${currentUser.id}'`),
            { headers }
        );
        const inscricoesData = await inscricoesResponse.json();

        loadingDiv.style.display = 'none';

        if (inscricoesData.records && inscricoesData.records.length > 0) {
            const eventosIds = inscricoesData.records.map(r => r.fields.evento_id);
            
            const eventosResponse = await fetch(`${AIRTABLE_API}/eventos`, { headers });
            const eventosData = await eventosResponse.json();

            const meusEventos = eventosData.records.filter(r => eventosIds.includes(r.id));

            meusEventos.forEach(record => {
                gridDiv.innerHTML += createEventoCard(record.id, record.fields, true);
            });

            document.querySelectorAll('.btn-cancelar-evento').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventoId = e.target.getAttribute('data-evento-id');
                    cancelarInscricaoEvento(eventoId).then(() => loadMeusEventos());
                });
            });

            document.querySelectorAll('.btn-ver-sessoes').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const eventoId = e.target.getAttribute('data-evento-id');
                    const eventoNome = e.target.getAttribute('data-evento-nome');
                    verSessoes(eventoId, eventoNome);
                });
            });
        } else {
            noEventosDiv.style.display = 'block';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        gridDiv.innerHTML = `<p style="color: var(--error-color);">Erro ao carregar eventos: ${error.message}</p>`;
    }
}

async function loadMinhasSessoes() {
    const loadingDiv = document.getElementById('loadingMinhasSessoes');
    const gridDiv = document.getElementById('minhasSessoesGrid');
    const noSessoesDiv = document.getElementById('noSessoes');
    
    loadingDiv.style.display = 'block';
    gridDiv.innerHTML = '';
    noSessoesDiv.style.display = 'none';

    try {
        const inscricoesResponse = await fetch(
            buildFilterUrl(`${AIRTABLE_API}/inscricoes_sessoes`, `{utilizador_id}='${currentUser.id}'`),
            { headers }
        );
        const inscricoesData = await inscricoesResponse.json();

        loadingDiv.style.display = 'none';

        if (inscricoesData.records && inscricoesData.records.length > 0) {
            const sessoesIds = inscricoesData.records.map(r => r.fields.sessao_id);
            
            const sessoesResponse = await fetch(`${AIRTABLE_API}/sessoes`, { headers });
            const sessoesData = await sessoesResponse.json();

            const minhasSessoes = sessoesData.records.filter(r => sessoesIds.includes(r.id));

            minhasSessoes.forEach(record => {
                gridDiv.innerHTML += createSessaoCard(record.id, record.fields, true);
            });

            document.querySelectorAll('.btn-cancelar-sessao').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sessaoId = e.target.getAttribute('data-sessao-id');
                    cancelarInscricaoSessao(sessaoId).then(() => loadMinhasSessoes());
                });
            });
        } else {
            noSessoesDiv.style.display = 'block';
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        gridDiv.innerHTML = `<p style="color: var(--error-color);">Erro ao carregar sessões: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
