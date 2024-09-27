const readline = require('readline');
const fs = require('fs');
const crypto = require('crypto');

const rl = readline.createInterface({
    //
    input: process.stdin,
    output: process.stdout
})

const criptografar = (senha) => {
    if (!senha) {
        throw new Error('Senha não pode ser vazia');
    }
    const hash = crypto.createHash('sha256');
    hash.update(senha);
    return hash.digest('hex');
};

const validacaoUsername = (username) => /^[A-Za-z]{5,12}$/.test(username);
const validacaoSenha = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/.test(senha);
const validacaoEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 
const carregarUsuarios = () => {
    try {
        if (fs.existsSync('users.json')) {
            const dados = fs.readFileSync('users.json', 'utf8');
            return dados ? JSON.parse(dados) : {};
        }
        return {};
    } catch (erro) {
        console.log('Erro ao ler arquivo: ', erro);
        return {};
    }
};

const salvarUsuarios = (usuarios) => {
    try {
        fs.writeFileSync('users.json', JSON.stringify(usuarios, null, 2));
    } catch (erro) {
        console.log('Erro ao salvar o arquivo: ', erro);
    }
};

const salvarUser = (username, senha, email) => {
    const users = carregarUsuarios();
    if (users[username]) {
        console.log('Nome de usuário já está em uso. Escolha outro nome.');
        return false;
    }

    users[username] = { senha: criptografar(senha), email };
    salvarUsuarios(users);
    return true;
};

const checarUser = (username, senha) => {
    const users = carregarUsuarios();
    return users[username] && users[username].senha === criptografar(senha);
};

const formatacaoTempo = (parametro) => {
    const dias = Math.floor(parametro / (1000 * 60 * 60 * 24));
    const horas = Math.floor((parametro % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((parametro % (1000 * 60 * 60)) / (1000 * 60));

    //
    const pluralize = (value, singular, plural) => value === 1 ? singular : plural;

    //
    let resultado = '';
    if (dias > 0) {
        resultado += `${dias} ${pluralize(dias, 'dia', 'dias')}`;
    }
    if (horas > 0 || dias > 0) {
        if (resultado) resultado += ', ';
        resultado += `${horas} ${pluralize(horas, 'hora', 'horas')}`;
    } 
    if (minutos > 0 || horas > 0 || dias > 0) {
        if (resultado) resultado += ', ';
        resultado += `${minutos} ${pluralize(minutos, 'minuto', 'minutos')}`;
    }

    //
    return resultado || '0 minutos';
};

const visualizarAgendamento = (username) => {
    let agendamento = {};
    try {
        if (fs.existsSync('agendamentos.json')) {
            const dados = fs.readFileSync('agendamentos.json', 'utf8');
            agendamento = dados ? JSON.parse(dados) : {};
        }
    } catch(erro) {
        console.log('Erro ao ler o arquivo: ', erro);
        return; 
    }

    const usuariosAgendados = Object.values(agendamento).filter(app => app.username === username);
    if (usuariosAgendados.length === 0) {
        console.log('Você não tem compromissos agendados.');
        mostrarOpcoes(username);
    } else {
        console.log('Seus compromissos agendados: ');
        usuariosAgendados.forEach(([id, app], index) => {
            const status = verificarAtraso(app.dataHora);
            console.log(`${index + 1}. Local: ${app.local}, Data e Hora: ${app.dataHora} - ${status}`);
        });

        rl.question('Deseja (1) Voltar, (2) Editar um agendamento ou (3) Deletar um agendamento? ', (escolha) => {
            if(escolha === '1') {
                mostrarOpcoes(username);
            } else if (escolha === '2') {
                editarAgendamento(username, usuariosAgendados);
            } else if (escolha === '3') {
                rl.question('Digite o número do agendamento que deseja deletar: ', (numero) => {
                    const index = parseInt(numero) - 1;
                    if (index >= 0 && index < usuariosAgendados.length) {
                        deletarAgendamento(username, usuariosAgendados[index][0]);
                    } else {
                        console.log('Número inválido.');
                        visualizarAgendamento(username);
                    }
                });
            } else {
                console.log('Escolha inválida');
                visualizarAgendamento(username);
            }
        });
    }
};

const salvarAgendamentos = (agendamentos) => {
    fs.writeFile('agendamentos.json', JSON.stringify(agendamentos), 'utf8', (err) => {
        if (err) {
            console.error('Erro ao salvar o arquivo:', err);
        } else {
            console.log('Arquivo salvo com sucesso!');
        }
    });
};

const editarAgendamento = (username, usuariosAgendados) => {
    console.log('Seus compromissos agendados: ');
    usuariosAgendados.forEach(([id, app], index) => {
        console.log(`${index + 1}. Local: ${app.local}, Data e Hora: ${app.dataHora}`);
    });

    rl.question('Digite o número do agendamento que deseja editar: ', (numero) => {
        const index = parseInt(numero) - 1;
        if (index >= 0 && index < usuariosAgendados.length) {
            const agendamentoSelecionado = usuariosAgendados[index];
            const [id, app] = agendamentoSelecionado;

            //
            if (app.username !== username) {
                console.log('Você não tem permissão para editar este agendamento.');
                visualizarAgendamento(username);
                return;
            }

            rl.question('Você quer editar a data ou o conteúdo? (Digite "data" ou "conteudo") ', (tipo) => {
                if (tipo === 'data') {
                    rl.question('Digite a nova data(DD/MM/AAAA HH:MM): ', (novaData) => {
                        app.dataHora = novaData;
                        console.log('Data atualizada com sucesso!');
                        salvarAgendamentos();
                        visualizarAgendamento(username);
                    });
                } else if (tipo === 'conteudo') {
                    rl.question('Digite o novo conteúdo: ', (novoConteudo) => {
                        app.local = novoConteudo;
                        console.log('Conteúdo atualizado com sucesso!');
                        salvarAgendamentos();
                        visualizarAgendamento(username);
                    });
                } else {
                    console.log('Escolha inválida!');
                    editarAgendamento(username, usuariosAgendados);
                }
            });
        } else {
            console.log('Número inválido.');
            editarAgendamento(username, usuariosAgendados);
        }
    });
}

const deletarAgendamento = (username, id) => {
    let agendamentos = JSON.parse(fs.readFileSync('agendamentos.json', 'utf8'));
    delete agendamentos[id];

    try {
        fs.writeFileSync('agendamentos.json', JSON.stringify(agendamentos, null, 2));
        console.log('Compromisso deletado com sucesso!');
    } catch (writeErro) {
        console.log('Erro ao salvar o arquivo:', writeErro.message);
    }

    mostrarOpcoes(username);
}

const marcarAgendamento = (username) => {
    rl.question('Digite o local do compromisso (dentista, biblioteca, lanchonete, cursos, academia, etc.): ', (local) => {
        rl.question('Digite a data e a hora do compromisso (DD/MM/AAAA HH:MM): ', (dataH) => {
            const horaConvertida = dataHora(dataH);
        
            if(isNaN(horaConvertida.getTime())) {
                console.log('Formato de data e hora inválido. Use DD/MM/AAAA HH:MM');
                //
                marcarAgendamento(username);
                return;
            }
  
            const agendar = {
                username,
                local,
                dataHora: formatacaoTempo(horaConvertida),
                tipo: 'compromisso'
            };

            let agendamentos = {};
            try {
                //
                if (fs.existsSync('agendamentos.json')) {
                    const dados = fs.readFileSync('agendamentos.json', 'utf8');
                    //
                    if (dados.trim()) {
                        try {
                            agendamentos = JSON.parse(dados);
                        } catch (parseErro) {
                            console.log('Erro ao analisar o arquivo JSON:', parseErro.message);
                            return;
                        }
                    }
                }
            } catch (erro) {
                //
                console.log('Erro ao ler o arquivo:', erro.message);
                return; //
            }

            const id =  Date.new().toString();
            agendamentos[id] = agendar;

            try {
                fs.writeFileSync('agendamentos.json', JSON.stringify(agendamentos, null, 2));
            console.log('Compromisso agendado com sucesso!');
            } catch (writeErro) {
                console.log('Erro ao salvar o arquivo:', writeErro.message);
            }

            mostrarOpcoes(username); //
        });
    });
};


const formatarData = (date) => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;   
}

const dataHora = (input) => {
    const [data, tempo] = input.split(' ');
    if(!tempo) {
        return new Date(NaN)
    }

    const [ dia, mes, ano ] = data.split('/').map(Number);
    const [ horas, minutos ] = tempo.split(':').map(Number);
    return new Date(ano, mes - 1, dia, horas, minutos);
};

//
const verificarAtraso = (dataHoraCompromisso) => {
    const agora = new Date();
    const [dia, mes, ano, hora, minuto] = dataHoraCompromisso.split(/\/|\:/).map(Number);
    const dataCompromisso = new Date(ano, mes - 1, dia, hora, minuto);

    const tempoRestante = dataCompromisso - agora;

    if (tempoRestante < 0) {
        return 'Você está atrasado.';
    } else {
        return `Faltam ${formatacaoTempo(tempoRestante)} para seu compromisso.`;
    }
};

const mostrarOpcoes = (username) => {
    rl.question('O que você deseja fazer? (1) Agendar um compromisso (2) Verificar compromissos (3) Sair: ', (escolha) => {
        if(escolha === 1) {
            marcarAgendamento(username);
        } else if (escolha === 2) {
            visualizarAgendamento(username);
        } else if (escolha === 3) {
            console.log('Saindo...');
            rl.close();
        } else {
            console.log('Escolha invalida!');
            mostrarOpcoes(username);
        }
    });
};

const registro = () => {
    rl.question('Digite seu nome de usuário: ', (username) => {
        if (!validacaoUsername(username)) {
            console.log('Nome de usuário inválido. Deve conter apenas letras (A-Z, a-z) e ter de 5 a 12 caracteres.');
            registro();
            return;  
        }

        rl.question('Digite sua senha: ', (senha) => {
            if(!validacaoSenha){
                console.log('Senha inválida. Deve conter de 6 a 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos. ');
                registro();
                return;
            }

            if (salvarUser(username, senha)) {
                console.log('Usuário registrado com sucesso!');
            } else {
                registro(); //
            }
            mostrarOpcoes(username);

        });
    });
};

const recuperarSenha = () => {
    rl.question('Digite seu nome de usuário: ', (username) => {
        rl.question('Digite seu e-mail: ', (email) => {
            const users = carregarUsuarios();
            if (users[username] && users[username].email === email) {
                rl.question('Digite sua nova senha: ', (novaSenha) => {
                    if(!validacaoSenha(novaSenha)) {
                        console.log('Senha inválida. Deve conter de 6 a 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.');
                        recuperarSenha();
                        return;
                    } 
                    users[username].senha = criptografar(novaSenha);
                    salvarUsuarios(users);
                    console.log('Senha alterada com sucesso!');
                    mostrarMenu();
                });
            } else {
                console.log('Nome de usuário ou e-mail não encontrado!');
                mostrarMenu();
            }
        });
    });
};

const promptLogin = () => {
    rl.question('Digite seu nome de usuário: ', (username) => {
        rl.question('Digite sua senha: ', (senha) => {
            if (checarUser(username, senha)) {
                console.log('Login bem-sucedido!');
                visualizarAgendamento(username);
            } else {
                console.log('Nome de usuário ou senha incorretos!');
                promptLogin();
            }
        });
    });
};

const mostrarMenu = () => {
    console.log('\n===== Menu Principal =====');
    console.log('1. Registrar-se');
    console.log('2. Fazer login');
    console.log('3. Recuperar senha');
    console.log('4. Sair\n');

    rl.question('Escolha uma opção: ', (option) => {
        switch (option) {
            case '1':
                registro();
                break;
            case '2':
                promptLogin();
                break;
            case '3':
                recuperarSenha();
                break;
            case '4':
                rl.close();
                break;
            default:
                console.log('Opção inválida. Tente novamente.');
                mostrarMenu();
        }
    });
};
    
mostrarMenu();