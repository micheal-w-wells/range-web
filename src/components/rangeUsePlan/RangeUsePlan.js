import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button, Dropdown } from 'semantic-ui-react';

import UpdateZoneModal from './UpdateZoneModal';
import {
  RANGE_NUMBER, AGREEMENT_DATE,
  AGREEMENT_TYPE, DISTRICT, ZONE, PLAN_DATE,
  CONTACT_NAME, CONTACT_EMAIL, CONTACT_PHONE, EXTENDED, EXEMPTION_STATUS,
  ALTERNATIVE_BUSINESS_NAME, RANGE_NAME, NO_RUP_PROVIDED,
  COMPLETED_CONFIRMATION_CONTENT, COMPLETED_CONFIRMATION_HEADER,
  PENDING_CONFIRMATION_CONTENT, PENDING_CONFIRMATION_HEADER,
  DETAIL_RUP_BANNER_CONTENT, PRIMARY_AGREEMENT_HOLDER, OTHER_AGREEMENT_HOLDER,
} from '../../constants/strings';
import { COMPLETED, PENDING, PRIMARY_TYPE, OTHER_TYPE } from '../../constants/variables';
import { TextField, Status, ConfirmationModal, Banner } from '../common';
import { formatDate } from '../../handlers';

const propTypes = {
  agreement: PropTypes.shape({}).isRequired,
  updateRupStatus: PropTypes.func.isRequired,
  statuses: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isUpdatingStatus: PropTypes.bool.isRequired,
  getRupPDF: PropTypes.func.isRequired,
};

export class RangeUsePlan extends Component {
  constructor(props) {
    super(props);

    // store fields that can be updated within this page
    const { zone, plans } = props.agreement;
    const plan = plans[0];
    const status = plan && plan.status;

    this.state = {
      isCompletedModalOpen: false,
      isPendingModalOpen: false,
      isUpdateZoneModalOpen: false,
      zone,
      status,
      plan,
    };
  }

  onViewPDFClicked = () => {
    const { id: planId, agreementId } = this.state.plan;
    if (planId && agreementId) {
      this.props.getRupPDF(planId)
        .then((blob) => {
          // It is necessary to create a new blob object with mime-type explicitly set
          // otherwise only Chrome works like it should
          const newBlob = new Blob([blob], { type: 'application/octet-stream' });

          // IE doesn't allow using a blob object directly as link href
          // instead it is necessary to use msSaveOrOpenBlob
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
          }

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const data = window.URL.createObjectURL(newBlob);
          const link = this.pdfLink;
          link.href = data;
          link.download = `${agreementId || 'range-use-plan'}.pdf`;

          // Safari thinks _blank anchor are pop ups. We only want to set _blank
          // target if the browser does not support the HTML5 download attribute.
          // This allows you to download files in desktop safari if pop up blocking is enabled.
          if (typeof link.download === 'undefined') {
            link.setAttribute('target', '_blank');
          }

          link.click();
          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
          }, 100);
        });
    }
  }

  onYesCompletedClicked = () => {
    this.updateStatus(COMPLETED, this.closeCompletedConfirmModal);
  }

  onYesPendingClicked = () => {
    this.updateStatus(PENDING, this.closePendingConfirmModal);
  }

  onZoneClicked = () => {
    this.openUpdateZoneModal();
  }

  onZoneUpdated = (newZone) => {
    this.setState({ zone: newZone });
  }

  getAgreementHolders = (clients = []) => {
    let primaryAgreementHolder = {};
    const otherAgreementHolders = [];
    clients.forEach((client) => {
      if (client.clientTypeCode === PRIMARY_TYPE) {
        primaryAgreementHolder = client;
      } else if (client.clientTypeCode === OTHER_TYPE) {
        otherAgreementHolders.push(client);
      }
    });

    return { primaryAgreementHolder, otherAgreementHolders };
  }

  updateStatus = (statusName, closeConfirmModal) => {
    const { agreement, statuses: statusReferences, updateRupStatus } = this.props;
    const plan = agreement.plans[0];
    const status = statusReferences.find(s => s.name === statusName);
    if (status && plan) {
      const requestData = {
        planId: plan.id,
        statusId: status.id,
      };
      const statusUpdated = (newStatus) => {
        closeConfirmModal();
        this.setState({
          status: newStatus,
        });
      };
      updateRupStatus(requestData).then(statusUpdated);
    }
  }

  openModal = property => this.setState({ [property]: true })

  closeModal = property => this.setState({ [property]: false })

  openCompletedConfirmModal = () => this.openModal('isCompletedModalOpen')

  closeCompletedConfirmModal = () => this.closeModal('isCompletedModalOpen')

  openPendingConfirmModal = () => this.openModal('isPendingModalOpen')

  closePendingConfirmModal = () => this.closeModal('isPendingModalOpen')

  openUpdateZoneModal = () => this.openModal('isUpdateZoneModalOpen')

  closeUpdateZoneModal = () => this.closeModal('isUpdateZoneModalOpen')

  renderOtherAgreementHolders = client => (
    <TextField
      key={client.id}
      label={OTHER_AGREEMENT_HOLDER}
      text={client && client.name}
    />
  )

  render() {
    const {
      isCompletedModalOpen,
      isPendingModalOpen,
      isUpdateZoneModalOpen,
      zone = {},
      status = {},
      plan = {},
    } = this.state;
    const { agreement, isUpdatingStatus } = this.props;
    const statusDropdownOptions = [
      { key: 1, text: COMPLETED, value: 1, onClick: this.openCompletedConfirmModal },
      { key: 2, text: PENDING, value: 2, onClick: this.openPendingConfirmModal },
    ];

    // variables for textfields
    const {
      code: zoneCode,
      contactEmail,
      contactName,
      contactPhoneNumber,
      district,
    } = zone;
    const districtCode = district && district.code;
    const { name: statusName } = status;

    const {
      rangeName,
      alternateBusinessName,
      planStartDate,
      planEndDate,
      extension,
    } = plan;

    const {
      id,
      agreementStartDate,
      agreementEndDate,
      agreementExemptionStatus = {},
      clients,
    } = agreement;

    const exemptionStatusName = agreementExemptionStatus.description;

    const { primaryAgreementHolder, otherAgreementHolders } = this.getAgreementHolders(clients);
    const { name: primaryAgreementHolderName } = primaryAgreementHolder;
    const rupExist = rangeName;

    return (
      <div className="rup">
        <a
          className="rup__pdf-link"
          href="href"
          ref={(pdfLink) => { this.pdfLink = pdfLink; }}
        >
          pdf link
        </a>

        <UpdateZoneModal
          isUpdateZoneModalOpen={isUpdateZoneModalOpen}
          closeUpdateZoneModal={this.closeUpdateZoneModal}
          onZoneUpdated={this.onZoneUpdated}
          agreementId={id}
          currZone={zone}
        />

        <ConfirmationModal
          open={isCompletedModalOpen}
          header={COMPLETED_CONFIRMATION_HEADER}
          content={COMPLETED_CONFIRMATION_CONTENT}
          onNoClicked={this.closeCompletedConfirmModal}
          onYesClicked={this.onYesCompletedClicked}
          loading={isUpdatingStatus}
        />

        <ConfirmationModal
          open={isPendingModalOpen}
          header={PENDING_CONFIRMATION_HEADER}
          content={PENDING_CONFIRMATION_CONTENT}
          onNoClicked={this.closePendingConfirmModal}
          onYesClicked={this.onYesPendingClicked}
          loading={isUpdatingStatus}
        />

        <Banner
          header={id}
          content={rupExist ? DETAIL_RUP_BANNER_CONTENT : NO_RUP_PROVIDED}
          actionClassName={rupExist ? 'rup__actions' : 'rup__actions--hidden'}
        >
          <Status
            className="rup__status"
            status={statusName}
          />
          <div>
            <Button
              onClick={this.onViewPDFClicked}
              className="rup__btn"
            >
              View PDF
            </Button>
            { statusName !== COMPLETED &&
              <Dropdown
                className="rup__status-dropdown"
                text="Update Status"
                options={statusDropdownOptions}
                button
                item
              />
            }
          </div>
        </Banner>

        <div className="rup__content">
          <div className="rup__title">Basic Information</div>
          <div className="rup__row">
            <div className="rup__agreement-info rup__cell-6">
              <div className="rup__divider" />
              <div className="rup__info-title">Agreement Information</div>
              <TextField
                label={RANGE_NUMBER}
                text={id}
              />
              <TextField
                label={AGREEMENT_TYPE}
                text="Primary"
              />
              <TextField
                label={AGREEMENT_DATE}
                text={`${formatDate(agreementStartDate)} to ${formatDate(agreementEndDate)}`}
              />
              <TextField
                label={RANGE_NAME}
                text={rangeName}
              />
              <TextField
                label={ALTERNATIVE_BUSINESS_NAME}
                text={alternateBusinessName}
              />
            </div>
            <div className="rup__contact-info rup__cell-6">
              <div className="rup__divider" />
              <div className="rup__info-title">Contact Information</div>
              <TextField
                label={DISTRICT}
                text={districtCode}
              />
              <TextField
                label={ZONE}
                text={
                  <div className="rup__zone-text">
                    {zoneCode}
                    <Icon className="rup__zone-text__icon" name="pencil" />
                  </div>
                }
                isEditable
                onClick={this.onZoneClicked}
              />
              <TextField
                label={CONTACT_NAME}
                text={contactName}
              />
              <TextField
                label={CONTACT_PHONE}
                text={contactPhoneNumber}
              />
              <TextField
                label={CONTACT_EMAIL}
                text={contactEmail}
              />
            </div>
          </div>
          <div className="rup__row">
            <div className="rup__plan-info rup__cell-6">
              <div className="rup__divider" />
              <div className="rup__info-title">Plan Information</div>
              <TextField
                label={PLAN_DATE}
                text={`${formatDate(planStartDate)} to ${formatDate(planEndDate)}`}
              />
              <TextField
                label={EXTENDED}
                text={extension}
              />
              <TextField
                label={EXEMPTION_STATUS}
                text={exemptionStatusName}
              />
            </div>

            <div className="rup__plan-info rup__cell-6">
              <div className="rup__divider" />
              <div className="rup__info-title">Agreement Holders</div>
              <TextField
                label={PRIMARY_AGREEMENT_HOLDER}
                text={primaryAgreementHolderName}
              />
              {otherAgreementHolders.map(this.renderOtherAgreementHolders)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

RangeUsePlan.propTypes = propTypes;
export default RangeUsePlan;
