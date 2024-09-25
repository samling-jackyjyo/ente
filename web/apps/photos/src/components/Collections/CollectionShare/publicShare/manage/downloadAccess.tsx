import type {
    Collection,
    PublicURL,
    UpdatePublicURL,
} from "@/media/collection";
import { EnteMenuItem } from "@ente/shared/components/Menu/EnteMenuItem";
import { t } from "i18next";
import { AppContext } from "pages/_app";
import { useContext } from "react";
import { Trans } from "react-i18next";
interface Iprops {
    publicShareProp: PublicURL;
    collection: Collection;
    updatePublicShareURLHelper: (req: UpdatePublicURL) => Promise<void>;
}

export function ManageDownloadAccess({
    publicShareProp,
    updatePublicShareURLHelper,
    collection,
}: Iprops) {
    const appContext = useContext(AppContext);

    const handleFileDownloadSetting = () => {
        if (publicShareProp.enableDownload) {
            disableFileDownload();
        } else {
            updatePublicShareURLHelper({
                collectionID: collection.id,
                enableDownload: true,
            });
        }
    };

    const disableFileDownload = () => {
        appContext.setDialogMessage({
            title: t("DISABLE_FILE_DOWNLOAD"),
            content: <Trans i18nKey={"DISABLE_FILE_DOWNLOAD_MESSAGE"} />,
            close: { text: t("cancel") },
            proceed: {
                text: t("disable"),
                action: () =>
                    updatePublicShareURLHelper({
                        collectionID: collection.id,
                        enableDownload: false,
                    }),
                variant: "critical",
            },
        });
    };
    return (
        <EnteMenuItem
            checked={publicShareProp?.enableDownload ?? true}
            onClick={handleFileDownloadSetting}
            variant="toggle"
            label={t("FILE_DOWNLOAD")}
        />
    );
}
