import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import SeoHead from "@/components/SeoHead/SeoHead";
import {
  Button,
  Card,
  NoData,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  type AdminContentBlock,
  fetchAdminContent,
  putAdminContent,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface Draft {
  fr: string;
  nl: string;
  en: string;
}

const AdminContent = () => {
  const { t } = useTranslation();
  const admin = useAdminAuthStore((s) => s.admin);
  const [blocks, setBlocks] = useState<AdminContentBlock[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const reload = async () => {
    if (!admin) return;
    const res = await fetchAdminContent();
    const list = res?.data ?? [];
    setBlocks(list);
    const map: Record<string, Draft> = {};
    for (const b of list) {
      map[b.key] = {
        fr: b.value_fr ?? "",
        nl: b.value_nl ?? "",
        en: b.value_en ?? "",
      };
    }
    setDrafts(map);
  };

  useEffect(() => {
    void reload();
  }, [admin]);

  const save = async (key: string) => {
    if (!admin) return;
    const draft = drafts[key];
    if (!draft) return;
    const res = await putAdminContent(key, {
      valueFr: draft.fr,
      valueNl: draft.nl,
      valueEn: draft.en,
    });
    if (res) toast.success(t("admin.content.saved", { key }));
    await reload();
  };

  const updateDraft = (key: string, lang: keyof Draft, value: string) => {
    setDrafts((prev) => {
      const current = prev[key] ?? { fr: "", nl: "", en: "" };
      return { ...prev, [key]: { ...current, [lang]: value } };
    });
  };

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("admin.content.title")}
        description=""
        path="/admin/content"
      />
      <h1>{t("admin.content.title")}</h1>
      {blocks.length === 0 ? (
        <Card>
          <NoData />
        </Card>
      ) : (
        blocks.map((b) => (
          <Card key={b.key} className="panel">
            <h2>{b.key}</h2>
            <div className="adminContentGrid">
              <StyledInputTextArea
                label="FR"
                value={drafts[b.key]?.fr ?? ""}
                setValue={(v) => updateDraft(b.key, "fr", v)}
              />
              <StyledInputTextArea
                label="NL"
                value={drafts[b.key]?.nl ?? ""}
                setValue={(v) => updateDraft(b.key, "nl", v)}
              />
              <StyledInputTextArea
                label="EN"
                value={drafts[b.key]?.en ?? ""}
                setValue={(v) => updateDraft(b.key, "en", v)}
              />
            </div>
            <Button
              label={t("common.save")}
              style="blue"
              onClick={() => save(b.key)}
              margin="12px 0 0 0"
            />
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminContent;
