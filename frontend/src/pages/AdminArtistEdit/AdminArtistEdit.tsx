import "@/pages/ArtistDashboard/ArtistDashboard.scss";
import "./AdminArtistEdit.scss";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import SeoHead from "@/components/SeoHead/SeoHead";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  Checkbox,
  StyledDropdown,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import {
  type ArtistLevel,
  fetchAdminArtistDetail,
  putAdminArtist,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface EditForm extends Record<string, unknown> {
  slug: string;
  stageName: string;
  bioFr: string;
  bioNl: string;
  bioEn: string;
  genre: string;
  coverImageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  level: ArtistLevel;
}

const EMPTY_FORM: EditForm = {
  slug: "",
  stageName: "",
  bioFr: "",
  bioNl: "",
  bioEn: "",
  genre: "",
  coverImageUrl: "",
  isPublished: false,
  isFeatured: false,
  level: "L2",
};

interface LevelOption {
  id: ArtistLevel;
  name: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  { id: "L1", name: "L1 — Emerging (x20–x30)" },
  { id: "L2", name: "L2 — Established (x30–x40)" },
  { id: "L3", name: "L3 — Headliner (x40–x50)" },
  { id: "L4", name: "L4 — Top tier (x50–x60)" },
];

const AdminArtistEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const language = useLanguage();

  const [form, setForm] = useState<EditForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    void fetchAdminArtistDetail(id).then((res) => {
      if (res) {
        setForm({
          slug: res.slug,
          stageName: res.stage_name,
          bioFr: res.bio_fr ?? "",
          bioNl: res.bio_nl ?? "",
          bioEn: res.bio_en ?? "",
          genre: res.genre ?? "",
          coverImageUrl: res.cover_image_url ?? "",
          isPublished: res.is_published,
          isFeatured: res.is_featured,
          level: res.level ?? "L2",
        });
      }
      setLoading(false);
    });
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    const result = await putAdminArtist(id, { ...form });
    setSubmitting(false);
    if (result) {
      toast.success(t("admin.artists.saved"));
      navigate(getPagePath("adminArtists", language));
    }
  };

  if (loading) {
    return (
      <div className="artistDashboard">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("admin.artists.edit")}
        description=""
        path={`/admin/artists/${id}`}
      />
      <h1>
        {t("admin.artists.edit")} — {form.stageName}
      </h1>

      <form onSubmit={save}>
        <Card className="panel">
          <h2>{t("admin.artists.sections.identity")}</h2>
          <div className="adminFormGrid">
            <StyledInputText
              label={t("admin.artists.form.slug")}
              value={form.slug}
              setValue={(v) => setForm({ ...form, slug: v })}
              required
            />
            <StyledInputText
              label={t("admin.artists.form.stageName")}
              value={form.stageName}
              setValue={(v) => setForm({ ...form, stageName: v })}
              required
            />
            <StyledInputText
              label={t("admin.artists.form.genre")}
              value={form.genre}
              setValue={(v) => setForm({ ...form, genre: v })}
            />
            <StyledInputText
              label={t("admin.artists.form.coverImageUrl")}
              value={form.coverImageUrl}
              setValue={(v) => setForm({ ...form, coverImageUrl: v })}
            />
          </div>
        </Card>

        <Card className="panel">
          <h2>{t("admin.artists.sections.bios")}</h2>
          <div className="adminContentGrid">
            <StyledInputTextArea
              label={t("admin.artists.form.bioFr")}
              value={form.bioFr}
              setValue={(v) => setForm({ ...form, bioFr: v })}
              style={{ minHeight: "140px" }}
            />
            <StyledInputTextArea
              label={t("admin.artists.form.bioNl")}
              value={form.bioNl}
              setValue={(v) => setForm({ ...form, bioNl: v })}
              style={{ minHeight: "140px" }}
            />
            <StyledInputTextArea
              label={t("admin.artists.form.bioEn")}
              value={form.bioEn}
              setValue={(v) => setForm({ ...form, bioEn: v })}
              style={{ minHeight: "140px" }}
            />
          </div>
        </Card>

        <Card className="panel">
          <h2>{t("admin.artists.sections.pricing")}</h2>
          <p className="levelHint">{t("admin.artists.form.levelHint")}</p>
          <div className="adminFormGrid">
            <StyledDropdown<LevelOption>
              label={t("admin.artists.form.level")}
              value={
                LEVEL_OPTIONS.find((o) => o.id === form.level) ??
                LEVEL_OPTIONS[1]
              }
              setValue={(opt) => setForm({ ...form, level: opt?.id ?? "L2" })}
              itemList={LEVEL_OPTIONS}
              itemIdKey="id"
              itemLabelKey="name"
              width="100%"
            />
          </div>
        </Card>

        <Card className="panel">
          <h2>{t("admin.artists.sections.flags")}</h2>
          <div className="adminFormGrid">
            <Checkbox
              checked={form.isPublished}
              onChange={(checked) => setForm({ ...form, isPublished: checked })}
              label={t("admin.artists.published")}
            />
            <Checkbox
              checked={form.isFeatured}
              onChange={(checked) => setForm({ ...form, isFeatured: checked })}
              label={t("admin.artists.featured")}
            />
          </div>
        </Card>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button
            type="button"
            label={t("common.back")}
            style="line"
            onClick={() => navigate(getPagePath("adminArtists", language))}
          />
          <Button
            type="submit"
            label={t("common.save")}
            style="blue"
            isLoading={submitting}
          />
        </div>
      </form>
    </div>
  );
};

export default AdminArtistEdit;
