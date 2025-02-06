import { Boom } from '@hapi/boom'
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    WAMessageKey
} from '../src'
import P from 'pino'

async function connectToWhatsApp() {
    const logger = P({ level: 'debug' })
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')
    
    const sock = makeWASocket({
        logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: true
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Conexão fechada devido a ', lastDisconnect?.error, ', reconectando ', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('Conexão aberta')
        }
    })

    sock.ev.on('creds.update', saveCreds)

    async function createCommunity() {
        try {
            const result = await sock.createCommunity("Nome Comunidade", "Descrição da comuniade")
            console.log('Comunidade criada com sucesso:', result)
        } catch (error) {
            console.error('Erro ao criar a comunidade:', error)
        }
    }

    async function createGroup() {
        try {
            const result = await sock.groupCreate("Nome Grupo", ["5511977960411@s.whatsapp.net"])
            console.log('Grupo criada com sucesso:', result)
        } catch (error) {
            console.error('Erro ao criar grupo:', error)
        }
    }

    async function linkGroupToCommunity(group: string[]) {
        try {
            const result = await sock.linkGroupsToCommunity("120363310804118220@g.us", group)
//            const childTag = "links"
//            const getBinaryNodeChild = (result, childTag) => {
//                if(Array.isArray(result?.content)) {
//                    return result?.content.find(item => item.tag === childTag)
//                }
//            }
//            const res = getBinaryNodeChild(result, childTag)
           console.log(result)
41        } catch (error) {
            console.error('Erro ao linkar grupo:', error)
        }
    }

    async function unlinkGroupToCommunity(group: string) {
        try {
            await sock.unlinkGroupsToCommunity("120363310804118220@g.us", group)
            console.log('Grupo removido com sucesso')
        } catch (error) {
            console.error('Erro ao remover grupo:', error)
        }
    }

    async function communitySettingUpdate() {
        try {
            await sock.communitySettingUpdate("120363310804118220@g.us", "anyone")
            console.log('Alteração efetuada com sucesso')
        } catch (error) {
            console.error('Falha ao editar comunidade:', error)
        }
    }

    function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Chama a função para criar a comunidade após a conexão ser estabelecida
    sock.ev.on('connection.update', (update) => {
        if(update.connection === 'open') {
            //createGroup()
            //sleep(15000)
            createCommunity()
            //sleep(15000)
            //linkGroupToCommunity(["120363308653585923@g.us", "120363326822250844@g.us"])
            //sleep(15000)
            //unlinkGroupToCommunity()
            //sleep(15000)
            //communitySettingUpdate()
        }
    })
}

// Inicia a conexão
connectToWhatsApp()