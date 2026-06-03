import "./InvitationsPanel.scss";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaCopy, FaLink, FaSyncAlt, FaTrash } from "react-icons/fa";

import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";
import {
  Button,
  Card,
  type Column,
  DynamicTable,
  StyledDropdown,
  StyledInputEmail,
  StyledInputText,
  StyledInputTextArea,
} from "@/covaltech-react-ui";
import { useAdminAuthStore } from "@/stores/AdminAuthStore";
import {
  type AdminArtistInvitation,
  type AdminArtistInvitationCreateResult,
  type ArtistInvitationStatus,
  type ArtistLevel,
  type ArtistSetType,
  fetchAdminArtistInvitations,
  postAdminArtistInvitation,
  resendAdminArtistInvitation,
  revokeAdminArtistInvitation,
} from "@/Utils/Services/Authenticated/adminAreaApi";

interface InvitationForm {
  email: string;
  stageName: string;
  level: ArtistLevel;
  setType: ArtistSetType;
  customMessage: string;
}

const EMPTY_FORM: InvitationForm = {
  email: "",
  stageName: "",
  level: "L2",
  setType: "dj",
  customMessage: "",
};

interface LevelOption {
  id: ArtistLevel;
  name: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  { id: "L1", name: "L1 — Emerging" },
  { id: "L2", name: "L2 — Established" },
  { id: "L3", name: "L3 — Headliner" },
  { id: "L4", name: "L4 — Top tier" },
];

interface SetTypeOption {
  id: ArtistSetType;
  name: string;
}

interface StatusFilterOption {
  id: ArtistInvitationStatus | "all";
  name: string;
}

const InvitationsPanel = () => {
  const { t } = useTranslation();
  const admin = useAdminAuthStore((s) => s.admin);
  const [form, setForm] = useState<InvitationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] =
    useState<AdminArtistInvitationCreateResult | null>(null);
  const [invitations, setInvitations] = useState<AdminArtistInvitation[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    ArtistInvitationStatus | "all"
  >("all");

  const setTypeOptions: SetTypeOption[] = useMemo(
    () => [
      { id: "dj", name: t("admin.artists.invitations.setType.dj") },
      { id: "hybrid", name: t("admin.artists.invitations.setType.hybrid") },
      { id: "live", name: t("admin.artists.invitations.setType.live") },
    ],
    [t],
  );

  const statusFilterOptions: StatusFilterOption[] = useMemo(
    () => [
      { id: "all", name: t("admin.artists.invitations.filterStatusAll") },
      { id: "pending", name: t("admin.artists.invitations.status.pending") },
      { id: "accepted", name: t("admin.artists.invitations.status.accepted") },
      { id: "expired", name: t("admin.artists.invitations.status.expired") },
      { id: "revoked", name: t("admin.artists.invitations.status.revoked") },
    ],
    [t],
  );

  const reload = async () => {
    if (!admin) return;
    const res = await fetchAdminArtistInvitations({
      status: statusFilter === "all" ? undefined : statusFilter,
      pageSize: 100,
    });
    setInvitations(res?.data ?? []);
  };

  useEffect(() => {
    void reload();
  }, [admin, statusFilter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.stageName) return;
    setSubmitting(true);
    const result = await postAdminArtistInvitation({
      email: form.email.trim(),
      stageName: form.stageName.trim(),
      level: form.level,
      setType: form.setType,
      customMessage: form.customMessage.trim() || undefined,
    });
    setSubmitting(false);
    if (!result) return;
    toast.success(
      t("admin.artists.invitations.createdToast", { email: form.email }),
    );
    setLastResult(result);
    setForm(EMPTY_FORM);
    await reload();
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("admin.artists.invitations.linkCopied"));
    } catch {
      toast.error(t("admin.artists.invitations.linkCopied"));
    }
  };

  const handleResend = async (
    invitation: AdminArtistInvitation,
  ): Promise<boolean> => {
    const res = await resendAdminArtistInvitation(invitation.id);
    if (!res) return false;
    toast.success(
      t("admin.artists.invitations.resentToast", { email: invitation.email }),
    );
    setLastResult(res);
    await reload();
    return true;
  };

  // Generating a fresh link ROTATES the invitation token server-side, which
  // invalidates every previously-shared link. Surfaced via the button label and
  // a confirmation so the operator knows. (#49)
  const handleGenerateNewLink = async (
    invitation: AdminArtistInvitation,
  ): Promise<boolean> => {
    const res = await resendAdminArtistInvitation(invitation.id, {
      skipEmail: true,
    });
    if (!res) return false;
    setLastResult(res);
    await copyLink(res.invitationUrl);
    await reload();
    return true;
  };

  const handleRevoke = async (
    invitation: AdminArtistInvitation,
  ): Promise<boolean> => {
    const res = await revokeAdminArtistInvitation(invitation.id);
    if (!res) return false;
    toast.success(t("admin.artists.invitations.revokedToast"));
    await reload();
    return true;
  };

  const columns: Column[] = useMemo(
    () => [
      {
        title: t("admin.artists.invitations.col.stageName"),
        dataIndex: "stageName",
        render: (value: string) => <strong>{value}</strong>,
        mobile: { visible: true, order: 0, titleVisible: true },
      },
      {
        title: t("admin.artists.invitations.col.email"),
        dataIndex: "email",
        mobile: { visible: true, order: 1, titleVisible: true },
      },
      {
        title: t("admin.artists.invitations.col.level"),
        dataIndex: "level",
        mobile: { visible: true, order: 2, titleVisible: true },
      },
      {
        title: t("admin.artists.invitations.col.status"),
        dataIndex: "status",
        render: (value: ArtistInvitationStatus) => (
          <span
            className={`invitationStatus invitationStatus--${value}`}
            data-status={value}
          >
            {t(`admin.artists.invitations.status.${value}`)}
          </span>
        ),
        mobile: { visible: true, order: 3, titleVisible: true },
      },
      {
        title: t("admin.artists.invitations.col.expiresAt"),
        dataIndex: "expiresAt",
        render: (value: string) => new Date(value).toLocaleString(),
        mobile: { visible: true, order: 4, titleVisible: true },
      },
      {
        title: t("admin.artists.invitations.col.resendCount"),
        dataIndex: "resendCount",
        mobile: { visible: false },
      },
      {
        title: t("admin.artists.invitations.col.actions"),
        dataIndex: "id",
        colunmWidth: "180px",
        render: (_value: string, record: AdminArtistInvitation) => {
          const canResend =
            record.status === "pending" || record.status === "expired";
          const canRevoke = record.status === "pending";
          if (!canResend && !canRevoke) return <span>—</span>;
          return (
            <div className="invitationActions">
              {canResend && (
                <ConfirmModal
                  modalTitle={t("admin.artists.invitations.generateLinkTitle")}
                  modalContent={
                    <p>{t("admin.artists.invitations.generateLinkConfirm")}</p>
                  }
                  confirmLabel={t("admin.artists.invitations.generateLinkCta")}
                  onConfirm={() => handleGenerateNewLink(record)}
                  trigger={({ onClick }) => (
                    <Button
                      style="square"
                      icon={<FaLink />}
                      title={t("admin.artists.invitations.generateLink")}
                      onClick={onClick}
                    />
                  )}
                />
              )}
              {canResend && (
                <ConfirmModal
                  modalTitle={t("admin.artists.invitations.resendTitle")}
                  modalContent={
                    <p>
                      {t("admin.artists.invitations.resendConfirm", {
                        email: record.email,
                      })}
                    </p>
                  }
                  confirmLabel={t("admin.artists.invitations.resendCta")}
                  onConfirm={() => handleResend(record)}
                  trigger={({ onClick }) => (
                    <Button
                      style="square"
                      icon={<FaSyncAlt />}
                      title={t("admin.artists.invitations.resendCta")}
                      onClick={onClick}
                    />
                  )}
                />
              )}
              {canRevoke && (
                <ConfirmModal
                  modalTitle={t("admin.artists.invitations.revokeTitle")}
                  modalContent={
                    <p>{t("admin.artists.invitations.revokeConfirm")}</p>
                  }
                  confirmLabel={t("admin.artists.invitations.revokeCta")}
                  confirmStyle="danger"
                  onConfirm={() => handleRevoke(record)}
                  trigger={({ onClick }) => (
                    <Button
                      style="square"
                      icon={<FaTrash />}
                      title={t("admin.artists.invitations.revokeCta")}
                      onClick={onClick}
                    />
                  )}
                />
              )}
            </div>
          );
        },
        mobile: { visible: true, order: 5, titleVisible: false },
      },
    ],
    [t],
  );

  return (
    <>
      <Card className="panel">
        <h2>{t("admin.artists.invitations.create")}</h2>
        <p className="invitationsSubtitle">
          {t("admin.artists.invitations.subtitle")}
        </p>
        <form onSubmit={submit} className="adminFormGrid">
          <StyledInputEmail
            label={t("admin.artists.invitations.fields.email")}
            value={form.email}
            setValue={(v) => setForm({ ...form, email: v })}
            required
          />
          <StyledInputText
            label={t("admin.artists.invitations.fields.stageName")}
            value={form.stageName}
            setValue={(v) => setForm({ ...form, stageName: v })}
            required
          />
          <StyledDropdown<LevelOption>
            label={t("admin.artists.invitations.fields.level")}
            value={
              LEVEL_OPTIONS.find((o) => o.id === form.level) ?? LEVEL_OPTIONS[1]
            }
            setValue={(opt) => setForm({ ...form, level: opt?.id ?? "L2" })}
            itemList={LEVEL_OPTIONS}
            itemIdKey="id"
            itemLabelKey="name"
            width="100%"
          />
          <StyledDropdown<SetTypeOption>
            label={t("admin.artists.invitations.fields.setType")}
            value={
              setTypeOptions.find((o) => o.id === form.setType) ??
              setTypeOptions[0]
            }
            setValue={(opt) => setForm({ ...form, setType: opt?.id ?? "dj" })}
            itemList={setTypeOptions}
            itemIdKey="id"
            itemLabelKey="name"
            width="100%"
          />
          <div className="invitationsMessageRow">
            <StyledInputTextArea
              label={t("admin.artists.invitations.fields.customMessage")}
              value={form.customMessage}
              setValue={(v) => setForm({ ...form, customMessage: v })}
              style={{ minHeight: "100px" }}
            />
          </div>
          <Button
            type="submit"
            label={t("admin.artists.invitations.createCta")}
            style="blue"
            isLoading={submitting}
          />
        </form>

        {lastResult && (
          <div className="invitationResult">
            <p>{t("admin.artists.invitations.createdHint")}</p>
            <div className="invitationResult__row">
              <code className="invitationResult__url">
                {lastResult.invitationUrl}
              </code>
              <Button
                style="line"
                icon={<FaCopy />}
                label={t("admin.artists.invitations.copyLink")}
                onClick={() => copyLink(lastResult.invitationUrl)}
              />
            </div>
          </div>
        )}
      </Card>

      <Card className="panel">
        <h2>{t("admin.artists.invitations.list")}</h2>
        <div className="invitationsFilters">
          <StyledDropdown<StatusFilterOption>
            label={t("admin.artists.invitations.filterStatus")}
            value={
              statusFilterOptions.find((o) => o.id === statusFilter) ??
              statusFilterOptions[0]
            }
            setValue={(opt) => setStatusFilter(opt?.id ?? "all")}
            itemList={statusFilterOptions}
            itemIdKey="id"
            itemLabelKey="name"
            width="240px"
          />
        </div>
        {invitations.length === 0 ? (
          <p className="invitationsEmpty">
            {t("admin.artists.invitations.empty")}
          </p>
        ) : (
          <DynamicTable
            data={invitations}
            columns={columns}
            pagined
            mobile
            tableId="admin-artist-invitations"
          />
        )}
      </Card>
    </>
  );
};

export default InvitationsPanel;
