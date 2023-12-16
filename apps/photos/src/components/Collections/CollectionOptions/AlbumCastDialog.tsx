import { Button, Typography } from '@mui/material';
import DialogBoxV2 from '@ente/shared/components/DialogBoxV2';
import SingleInputForm, {
    SingleInputFormProps,
} from '@ente/shared/components/SingleInputForm';
import { t } from 'i18next';
import { getKexValue, setKexValue } from '@ente/shared/network/kexService';
import { SESSION_KEYS, getKey } from '@ente/shared/storage/sessionStorage';
import { boxSeal, toB64 } from '@ente/shared/crypto/internal/libsodium';
import { loadSender } from '@ente/shared/hooks/useCastSender';
import { useEffect, useState } from 'react';
import EnteButton from '@ente/shared/components/EnteButton';
import EnteSpinner from '@ente/shared/components/EnteSpinner';
import { VerticallyCentered } from '@ente/shared/components/Container';

interface Props {
    show: boolean;
    onHide: () => void;
    currentCollectionId: number;
}

enum AlbumCastError {
    TV_NOT_FOUND = 'TV_NOT_FOUND',
}

export default function AlbumCastDialog(props: Props) {
    const [view, setView] = useState<
        'choose' | 'auto' | 'pin' | 'auto-cast-error'
    >('choose');

    const onSubmit: SingleInputFormProps['callback'] = async (
        value,
        setFieldError
    ) => {
        try {
            await doCast(value);
            props.onHide();
        } catch (e) {
            const error = e as Error;
            let fieldError: string;
            switch (error.message) {
                case AlbumCastError.TV_NOT_FOUND:
                    fieldError = t('TV_NOT_FOUND');
                    break;
                default:
                    fieldError = t('UNKNOWN_ERROR');
                    break;
            }

            setFieldError(fieldError);
        }
    };

    const doCast = async (pin: string) => {
        // does the TV exist? have they advertised their existence?
        const tvPublicKeyKexKey = `${pin}_pubkey`;

        const tvPublicKeyB64 = await getKexValue(tvPublicKeyKexKey);
        if (!tvPublicKeyB64) {
            throw new Error(AlbumCastError.TV_NOT_FOUND);
        }

        // ok, they exist. let's give them the good stuff.
        const payload = JSON.stringify({
            ...window.localStorage,
            sessionKey: getKey(SESSION_KEYS.ENCRYPTION_KEY),
            targetCollectionId: props.currentCollectionId,
        });

        const encryptedPayload = await boxSeal(
            await toB64(new TextEncoder().encode(payload)),
            tvPublicKeyB64
        );

        const encryptedPayloadForTvKexKey = `${pin}_payload`;

        // hey TV, we acknowlege you!
        await setKexValue(encryptedPayloadForTvKexKey, encryptedPayload);
    };

    useEffect(() => {
        if (view === 'auto') {
            loadSender().then(async (sender) => {
                const { cast } = sender;

                const instance = await cast.framework.CastContext.getInstance();
                try {
                    await instance.requestSession();
                } catch (e) {
                    console.log('Error requesting session:', e);
                    return;
                }
                const session = instance.getCurrentSession();
                console.log(session);
                session.addMessageListener(
                    'urn:x-cast:pair-request',
                    (namespace, message) => {
                        const data = message;
                        const obj = JSON.parse(data);
                        const code = obj.code;

                        if (code) {
                            doCast(code)
                                .then(() => {
                                    setView('choose');
                                    props.onHide();
                                })
                                .catch((e) => {
                                    setView('auto-cast-error');
                                    console.error(e);
                                });
                        }
                    }
                );

                console.log('sending message');
                session
                    .sendMessage('urn:x-cast:pair-request', {})
                    .then(() => {
                        console.log('Message sent successfully');
                    })
                    .catch((error) => {
                        console.log('Error sending message:', error);
                    });
            });
        }
    }, [view]);

    return (
        <DialogBoxV2
            sx={{ zIndex: 1600 }}
            open={props.show}
            onClose={props.onHide}
            attributes={{
                title: t('CAST_ALBUM_TO_TV'),
            }}>
            {view === 'choose' && (
                <>
                    <Button
                        onClick={() => {
                            setView('auto');
                        }}>
                        {t('AUTO_CAST_PAIR')}
                    </Button>
                    <Typography color={'text.muted'}>
                        {t('AUTO_CAST_PAIR_REQUIRES_CONNECTION_TO_GOOGLE')}
                    </Typography>
                    <Button
                        onClick={() => {
                            setView('pin');
                        }}>
                        {t('PAIR_WITH_PIN')}
                    </Button>
                </>
            )}
            {view === 'auto' && (
                <VerticallyCentered gap="1rem">
                    <EnteSpinner />
                    <Typography>{t('CHOOSE_DEVICE_FROM_BROWSER')}</Typography>
                    <EnteButton
                        variant="text"
                        onClick={() => {
                            setView('choose');
                        }}>
                        {t('GO_BACK')}
                    </EnteButton>
                </VerticallyCentered>
            )}
            {view === 'auto-cast-error' && (
                <VerticallyCentered gap="1rem">
                    <Typography>{t('TV_NOT_FOUND')}</Typography>
                    <EnteButton
                        variant="text"
                        onClick={() => {
                            setView('choose');
                        }}>
                        {t('GO_BACK')}
                    </EnteButton>
                </VerticallyCentered>
            )}
            {view === 'pin' && (
                <>
                    <Typography>{t('ENTER_CAST_PIN_CODE')}</Typography>
                    <SingleInputForm
                        callback={onSubmit}
                        fieldType="text"
                        placeholder={'123456'}
                        buttonText={t('PAIR_DEVICE_TO_TV')}
                        submitButtonProps={{ sx: { mt: 1, mb: 2 } }}
                    />
                    <EnteButton
                        variant="text"
                        onClick={() => {
                            setView('choose');
                        }}>
                        {t('GO_BACK')}
                    </EnteButton>
                </>
            )}
        </DialogBoxV2>
    );
}
