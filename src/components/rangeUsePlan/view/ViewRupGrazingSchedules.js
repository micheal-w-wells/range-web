import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Table, Icon } from 'semantic-ui-react';
import * as utils from '../../../utils';
import * as strings from '../../../constants/strings';
import { REFERENCE_KEY } from '../../../constants/variables';

class ViewRupGrazingSchedules extends Component {
  static propTypes = {
    elementId: PropTypes.string.isRequired,
    plan: PropTypes.shape({}).isRequired,
    pasturesMap: PropTypes.shape({}).isRequired,
    grazingSchedulesMap: PropTypes.shape({}).isRequired,
    references: PropTypes.shape({}).isRequired,
    usage: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  state = {
    activeScheduleIndex: 0,
  }

  onScheduleClicked = scheduleIndex => () => {
    this.setState((prevState) => {
      const newIndex = prevState.activeScheduleIndex === scheduleIndex ? -1 : scheduleIndex;
      return {
        activeScheduleIndex: newIndex,
      };
    });
  }

  renderSchedules = (grazingSchedules = []) => {
    const { plan } = this.props;
    const status = plan && plan.status;

    if (utils.isStatusDraft(status)) {
      return (
        <div className="rup__grazing-schedule__draft-container">
          <div className="rup__grazing-schedule__in-draft">
            <Icon name="lock" size="big" />
            <div style={{ marginLeft: '10px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 'bold' }}> RUP Awaiting Input from Agreement Holder </div>
              <div style={{ opacity: '0.7' }}> This section will remain hidden until the agreement holder submits for staff reviews. </div>
            </div>
          </div>
        </div>
      );
    }
    if (grazingSchedules.length === 0) {
      return <div className="rup__section-not-found">{strings.NOT_PROVIDED}</div>;
    }

    return (
      <ul className={classnames('rup__grazing-schedules', { 'rup__grazing-schedules--empty': grazingSchedules.length === 0 })}>
        {grazingSchedules.map(this.renderSchedule)}
      </ul>
    );
  }

  renderSchedule = (schedule, scheduleIndex) => {
    const {
      usage,
      references,
      pasturesMap,
    } = this.props;
    const grazingScheduleEntries = schedule.grazingScheduleEntries || [];
    const { id, year, narative } = schedule;
    const yearUsage = usage.find(u => u.year === year);
    const authorizedAUMs = yearUsage && yearUsage.authorizedAum;
    const livestockTypes = references[REFERENCE_KEY.LIVESTOCK_TYPE];
    const crownTotalAUMs = utils.roundTo1Decimal(utils.calcCrownTotalAUMs(grazingScheduleEntries, pasturesMap, livestockTypes));
    const isScheduleActive = this.state.activeScheduleIndex === scheduleIndex;

    return (
      <li key={id} className="rup__grazing-schedule">
        <div className="rup__grazing-schedule__header">
          <button
            className="rup__grazing-schedule__header__title"
            onClick={this.onScheduleClicked(scheduleIndex)}
          >
            <div>
              {`${year} Grazing Schedule`}
            </div>
            {isScheduleActive &&
              <Icon name="chevron up" />
            }
            {!isScheduleActive &&
              <Icon name="chevron down" />
            }
          </button>
        </div>
        <div className={classnames('rup__grazing-schedule__content', { 'rup__grazing-schedule__content__hidden': !isScheduleActive })}>
          <Table unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{strings.PASTURE}</Table.HeaderCell>
                <Table.HeaderCell>{strings.LIVESTOCK_TYPE}</Table.HeaderCell>
                <Table.HeaderCell>{strings.NUM_OF_ANIMALS}</Table.HeaderCell>
                <Table.HeaderCell>{strings.DATE_IN}</Table.HeaderCell>
                <Table.HeaderCell>{strings.DATE_OUT}</Table.HeaderCell>
                <Table.HeaderCell>{strings.DAYS}</Table.HeaderCell>
                <Table.HeaderCell>{strings.GRACE_DAYS}</Table.HeaderCell>
                <Table.HeaderCell>{strings.PLD}</Table.HeaderCell>
                <Table.HeaderCell>{strings.CROWN_AUMS}</Table.HeaderCell>
              </Table.Row>
              {grazingScheduleEntries.map(this.renderScheduleEntry)}
            </Table.Header>
          </Table>
          <div className="rup__grazing-schedule__content__AUMs" style={{ marginTop: '10px' }}>
            <div className="rup__grazing-schedule__content__AUM-label">Authorized AUMs</div>
            <div className="rup__grazing-schedule__content__AUM-number">{authorizedAUMs}</div>
            <div className="rup__grazing-schedule__content__AUM-label">Total AUMs</div>
            <div className="rup__grazing-schedule__content__AUM-number">{crownTotalAUMs}</div>
          </div>
          <div>
            <div className="rup__grazing-schedule__content__narative__title">Schedule Description</div>
            {utils.handleNullValue(narative)}
          </div>
        </div>
      </li>
    );
  }

  renderScheduleEntry = (entry) => {
    const { references, pasturesMap } = this.props;
    const livestockTypes = references[REFERENCE_KEY.LIVESTOCK_TYPE];
    const {
      id,
      pastureId,
      livestockTypeId,
      livestockCount,
      dateIn,
      dateOut,
      graceDays,
    } = entry || {};

    const days = utils.calcDateDiff(dateOut, dateIn, false);
    const pasture = pasturesMap[pastureId];
    const pldPercent = pasture && pasture.pldPercent;
    const pastureName = pasture && pasture.name;
    const livestockType = livestockTypes.find(lt => lt.id === livestockTypeId);
    const livestockTypeName = livestockType && livestockType.name;
    const auFactor = livestockType && livestockType.auFactor;

    const totalAUMs = utils.calcTotalAUMs(livestockCount, days, auFactor);
    const pldAUMs = utils.roundTo1Decimal(utils.calcPldAUMs(totalAUMs, pldPercent));
    const crownAUMs = utils.roundTo1Decimal(utils.calcCrownAUMs(totalAUMs, pldAUMs));

    return (
      <Table.Row key={id}>
        <Table.Cell>{utils.handleNullValue(pastureName, false)}</Table.Cell>
        <Table.Cell>{utils.handleNullValue(livestockTypeName, false)}</Table.Cell>
        <Table.Cell collapsing>{utils.handleNullValue(livestockCount, false)}</Table.Cell>
        <Table.Cell>{utils.formatDateFromServer(dateIn, false)}</Table.Cell>
        <Table.Cell>{utils.formatDateFromServer(dateOut, false)}</Table.Cell>
        <Table.Cell collapsing>{utils.handleNullValue(days, false)}</Table.Cell>
        <Table.Cell collapsing>{utils.handleNullValue(graceDays, false)}</Table.Cell>
        <Table.Cell collapsing>{utils.handleNullValue(pldAUMs, false)}</Table.Cell>
        <Table.Cell collapsing>{utils.handleNullValue(crownAUMs, false)}</Table.Cell>
      </Table.Row>
    );
  }

  render() {
    const { elementId, plan, grazingSchedulesMap } = this.props;
    const grazingScheduleIds = plan && plan.grazingSchedules;
    const grazingSchedules = grazingScheduleIds && grazingScheduleIds.map(id => grazingSchedulesMap[id]);

    return (
      <div id={elementId} className="rup__grazing-schedules__container">
        <div className="rup__title">Schedules</div>
        <div className="rup__divider" />
        {this.renderSchedules(grazingSchedules)}
      </div>
    );
  }
}

export default ViewRupGrazingSchedules;