import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon, Dropdown } from 'semantic-ui-react';
import EditableManagementConsiderationRow from './EditableManagementConsiderationRow';
import { updateManagementConsideration, openConfirmationModal, closeConfirmationModal } from '../../../actions';
import { InvertedButton } from '../../common';
import { REFERENCE_KEY } from '../../../constants/variables';

class EditableManagementConsiderations extends Component {
  static propTypes = {
    plan: PropTypes.shape({}).isRequired,
    managementConsiderationsMap: PropTypes.shape({}).isRequired,
  }

  onConsiderationOptionChanged = (e, { value }) => {
    console.log('onConsiderationOptionChanged');
  }

  renderAdditionalRequirement = (managementConsideration) => {
    return (
      <EditableManagementConsiderationRow
        key={managementConsideration.id}
        managementConsideration={managementConsideration}
        {...this.props}
      />
    );
  }

  renderManagementConsiderations = (managementConsiderations = []) => {
    const isEmpty = managementConsiderations.length === 0;

    return isEmpty ? (
      <div className="rup__m-considerations__no-content">No management considerations provided</div>
    ) : (
      managementConsiderations.map(this.renderAdditionalRequirement)
    );
  }

  render() {
    const { plan, managementConsiderationsMap, references } = this.props;
    const managementConsiderationIds = plan && plan.managementConsiderations;
    const managementConsiderations = managementConsiderationIds &&
      managementConsiderationIds.map(id => managementConsiderationsMap[id]);
    const considerTypes = references[REFERENCE_KEY.MANAGEMENT_CONSIDERATION_TYPE] || [];
    const considerTypeOptions = considerTypes.map((ct) => {
      return {
        key: ct.id,
        value: ct.id,
        text: ct.name,
      };
    });

    return (
      <div className="rup__m-considerations">
        <div className="rup__content-title">Management Considerations</div>
        <div className="rup__divider" />

        <div className="rup__m-considerations__note">
          Content in this section is non-legal and is intended to provide additional information about management within the agreement area.
        </div>

        <div className="rup__m-considerations__box">
          <div className="rup__m-consideration__header">
            <div>Considerations</div>
            <div>Details</div>
          </div>

          {this.renderManagementConsiderations(managementConsiderations)}

          <Dropdown
            trigger={
              <InvertedButton
                primaryColor
                compact
                style={{ marginTop: '10px' }}
              >
                <Icon name="add circle" />
                Add Consideration
              </InvertedButton>
            }
            options={considerTypeOptions}
            icon={null}
            pointing="left"
            onChange={this.onConsiderationOptionChanged}
            selectOnBlur={false}
          />
        </div>
      </div>
    );
  }
}

export default connect(null, {
  updateManagementConsideration,
  openConfirmationModal,
  closeConfirmationModal,
})(EditableManagementConsiderations);
