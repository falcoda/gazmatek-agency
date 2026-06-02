import "@/pages/ArtistDashboard/ArtistDashboard.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaEye,
  FaEyeSlash,
  FaFileDownload,
  FaPen,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import SeoHead from "@/components/SeoHead/SeoHead";
import TierIndicator from "@/components/TierIndicator/TierIndicator";
import { getPagePath } from "@/config/pages";
import {
  Button,
  Card,
  Checkbox,
  type Column,
  DynamicTable,
  StyledInputText,
} from "@/covaltech-react-ui";
import { useLanguage } from "@/hooks/useLanguage";
import InvitationsPanel from "@/pages/AdminArtists/InvitationsPanel/InvitationsPanel";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  type AdminArtistRow,
  deleteAdminArtist,
  downloadAdminArtistEngagementContract,
  fetchAdminArtists,
  postAdminArtist,
  putAdminArtist,
  resetAdminArtistEngagementContract,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface ArtistForm extends Record<string, unknown> {
  slug: string;
  stageName: string;
  genre: string;
  isPublished: boolean;
  isFeatured: boolean;
}

const blankForm: ArtistForm = {
  slug: "",
  stageName: "",
  genre: "",
  isPublished: false,
  isFeatured: false,
};

const AdminArtists = () => {
  const { t } = useTranslation();
  const language = useLanguage();
  const navigate = useNavigate();
  const token = useAdminAuthStore((s) => s.token);
  const [artists, setArtists] = useState<AdminArtistRow[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<ArtistForm>(blankForm);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const reload = async (q?: string) => {
    if (!token) return;
    const res = await fetchAdminArtists(q?.trim() || undefined);
    setArtists(res?.data ?? []);
    setTotal(res?.pagination.total ?? 0);
  };

  useEffect(() => {
    void reload();
  }, [token]);

  // Debounced search — re-query the backend 300ms after the last keystroke
  // so we don't fire a request on every character.
  useEffect(() => {
    if (!token) return;
    const handle = setTimeout(() => {
      void reload(search);
    }, 300);
    return () => clearTimeout(handle);
  }, [search, token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !form.slug || !form.stageName) return;
    setSubmitting(true);
    const created = await postAdminArtist({ ...form });
    setSubmitting(false);
    if (created) {
      toast.success(t("admin.artists.created"));
      setForm(blankForm);
      await reload();
    }
  };

  const togglePublished = async (a: AdminArtistRow) => {
    if (!token) return;
    await putAdminArtist(a.id, { isPublished: !a.is_published });
    await reload();
  };

  const remove = async (id: string): Promise<boolean> => {
    if (!token) return false;
    const result = await deleteAdminArtist(id);
    if (!result.ok) {
      toast.error(t("admin.artists.deleteFailed"));
      return false;
    }
    toast.success(t("admin.artists.deleted"));
    await reload();
    return true;
  };

  const resetContract = async (artist: AdminArtistRow): Promise<boolean> => {
    if (!token) return false;
    const res = await resetAdminArtistEngagementContract(artist.id);
    if (!res?.ok) {
      toast.error(t("admin.artists.contract.resetFailed"));
      return false;
    }
    toast.success(t("admin.artists.contract.resetDone"));
    await reload();
    return true;
  };

  const downloadContract = async (artist: AdminArtistRow) => {
    if (!token) return;
    const ok = await downloadAdminArtistEngagementContract(
      artist.id,
      `engagement-${artist.slug}.pdf`,
    );
    if (!ok) toast.error(t("admin.artists.contract.downloadFailed"));
  };

  const columns: Column[] = useMemo(
    () => [
      {
        title: t("admin.artists.form.stageName"),
        dataIndex: "stage_name",
        sortable: true,
        render: (value: string, record: AdminArtistRow) => (
          <span>
            <strong>{value}</strong>
            <span style={{ opacity: 0.6, marginLeft: 6 }}>({record.slug})</span>
          </span>
        ),
        mobile: { visible: true, order: 0, titleVisible: true },
      },
      {
        title: t("admin.artists.form.genre"),
        dataIndex: "genre",
        render: (value: string | null) => value ?? "—",
        mobile: { visible: true, order: 1, titleVisible: true },
      },
      {
        title: t("admin.artists.form.level"),
        dataIndex: "level",
        sortable: true,
        render: (value: string) => (
          <TierIndicator
            tier={
              value === "L1"
                ? "tier1"
                : value === "L2"
                  ? "tier2"
                  : value === "L3"
                    ? "tier3"
                    : "tier4"
            }
            ariaLabel={value}
          />
        ),
        mobile: { visible: true, order: 2, titleVisible: true },
      },
      {
        title: t("admin.artists.published"),
        dataIndex: "is_published",
        render: (value: boolean) => (value ? "✓" : "—"),
        mobile: { visible: true, order: 3, titleVisible: true },
      },
      {
        title: t("admin.artists.featured"),
        dataIndex: "is_featured",
        render: (value: boolean) => (value ? "★" : "—"),
        mobile: { visible: true, order: 4, titleVisible: true },
      },
      {
        title: "",
        dataIndex: "id",
        colunmWidth: "240px",
        render: (_value: string, record: AdminArtistRow) => (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Button
              style="square"
              icon={<FaPen />}
              title={t("admin.artists.edit")}
              onClick={() =>
                navigate(
                  `${getPagePath("adminArtists", language)}/${record.id}`,
                )
              }
            />
            <Button
              style="square"
              icon={record.is_published ? <FaEyeSlash /> : <FaEye />}
              title={
                record.is_published
                  ? t("admin.artists.unpublish")
                  : t("admin.artists.publish")
              }
              onClick={() => togglePublished(record)}
            />
            <Button
              style="square"
              icon={<FaFileDownload />}
              title={t("admin.artists.contract.download")}
              onClick={() => downloadContract(record)}
            />
            <ConfirmModal
              modalTitle={t("admin.artists.contract.resetTitle")}
              modalContent={
                <p>
                  {t("admin.artists.contract.resetConfirm", {
                    name: record.stage_name,
                  })}
                </p>
              }
              confirmLabel={t("admin.artists.contract.resetCta")}
              confirmStyle="danger"
              onConfirm={() => resetContract(record)}
              trigger={({ onClick }) => (
                <Button
                  style="square"
                  icon={<FaSyncAlt />}
                  title={t("admin.artists.contract.reset")}
                  onClick={onClick}
                />
              )}
            />
            <ConfirmModal
              modalTitle={t("admin.artists.deleteTitle")}
              modalContent={
                <p>
                  {t("admin.artists.deleteConfirmBody", {
                    name: record.stage_name,
                  })}
                </p>
              }
              confirmLabel={t("common.delete")}
              confirmStyle="danger"
              onConfirm={() => remove(record.id)}
              trigger={({ onClick }) => (
                <Button
                  style="square"
                  icon={<FaTrash />}
                  title={t("common.delete")}
                  onClick={onClick}
                />
              )}
            />
          </div>
        ),
        mobile: { visible: true, order: 5, titleVisible: false },
      },
    ],
    [t],
  );

  return (
    <div className="artistDashboard">
      <SeoHead
        title={t("admin.artists.title")}
        description=""
        path="/admin/artists"
      />
      <h1>{t("admin.artists.title")}</h1>

      <Card className="panel">
        <h2>{t("admin.artists.create")}</h2>
        <form onSubmit={submit} className="adminFormGrid">
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
          <Button
            type="submit"
            label={t("common.submit")}
            style="blue"
            isLoading={submitting}
          />
        </form>
      </Card>

      <Card className="panel">
        <h2>{t("admin.artists.list")}</h2>
        {total > artists.length ? (
          <p className="listTruncationWarning" role="alert">
            {t("admin.list.truncationWarning", {
              shown: artists.length,
              total,
            })}
          </p>
        ) : null}
        <div style={{ maxWidth: 360, marginBottom: 12 }}>
          <StyledInputText
            label={t("admin.artists.searchLabel")}
            placeholder={t("admin.artists.searchPlaceholder")}
            value={search}
            setValue={setSearch}
          />
        </div>
        <DynamicTable
          data={artists}
          columns={columns}
          pagined
          mobile
          tableId="admin-artists"
        />
      </Card>

      <InvitationsPanel />
    </div>
  );
};

export default AdminArtists;
