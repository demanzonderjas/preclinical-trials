import React from "react";
import { observer } from "mobx-react-lite";
import { useUser } from "../../hooks/useUser";
import { TSettingName } from "../../typings/auth";
import { Slider } from "../base/Slider";
import { useTranslationStore } from "../../hooks/useTranslationStore";

export const NotifyToggle: React.FC = observer(() => {
	const { user, updateSetting, getSettingValue } = useUser();
	const { t } = useTranslationStore();

	if (!user) {
		return null;
	}

	const handleToggle = async (isToggled: boolean) => {
		await updateSetting(TSettingName.DisableNotifications, !isToggled);
	};

	const settingValue = getSettingValue(TSettingName.DisableNotifications);
	const defaultSetting = settingValue !== undefined ? Boolean(+settingValue) : true;

	return (
		<div className="NotifyToggle">
			<label style={{ fontWeight: "bold" }}>{t("receive_message_notifications")}</label>
			<Slider defaultValue={!defaultSetting} handleToggle={handleToggle} style="secondary" />
		</div>
	);
});
