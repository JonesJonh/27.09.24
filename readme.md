1. Importação de modulos
readline: Permite a leitura de entrada do usuário via linha de comando.
fs: Manipula o sistema de arquivos para leitura e escrita de dados.
crypto: Fornece funções criptográficas, como hashing.

2. Configuração da interface da leitura
Configura a interface de leitura para capturar a entrada do usuário e exibir a saída no terminal.

3. Função de Criptografia de Senha
Usa o algoritmo SHA-256 para criptografar a senha e retorna o hash hexadecimal.

4. Validações
validacaoUsername: Verifica se o nome de usuário contém apenas letras e tem entre 5 e 12 caracteres.
validacaoSenha: Verifica se a senha tem entre 6 e 12 caracteres e inclui letras maiúsculas, minúsculas, números e símbolos.
valildacaoEmail: Valida se o e-mail tem o formato correto.

5. Manipulação de Arquivos de Usuários
carregarUsuarios: Lê o arquivo users.json e retorna o conteúdo como objeto JavaScript.
salvarUsuarios: Salva o objeto de usuários no arquivo users.json.

6. Funções de Registro e Login
salvarUser: Adiciona um novo usuário ao objeto de usuários, criptografa a senha e salva no arquivo.
checarUser: Verifica se o nome de usuário e senha correspondem aos dados salvos.

7. Funções de Agendamento
visualizarAgendamento: Exibe os compromissos agendados do usuário e oferece opções para editar ou deletar.
salvarAgendamentos: Salva os compromissos no arquivo agendamentos.json.
editarAgendamento: Permite editar a data ou o conteúdo de um compromisso.
deletarAgendamento: Remove um compromisso do arquivo.
marcarAgendamento: Adiciona um novo compromisso.

8. Funções de Manipulação de Datas e Tempo
formatacaoTempo: Formata a diferença de tempo em dias, horas e minutos.
formatarData: Formata uma data em string no formato DD/MM/AAAA HH:MM.
dataHora: Converte uma string de data e hora em um objeto Date.
verificarAtraso: Verifica se um compromisso está atrasado e retorna uma mensagem apropriada.

9. Funções de MenumostrarOpcoes: 
Exibe as opções disponíveis após o login do usuário.
registro: Gerencia o processo de registro de um novo usuário.
recuperarSenha: Permite ao usuário recuperar sua senha se ele fornecer o e-mail correto.
promptLogin: Gerencia o processo de login.
mostrarMenu: Exibe o menu principal da aplicação e redireciona para as opções apropriadas.

É seguro?
Como acessar
Como cadastrar?
Como pagar? É gratuito?
como trocar senha?
validar senha
Registro/cadastro no telefone caso perca a senha