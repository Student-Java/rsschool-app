import * as React from 'react';
import moment from 'moment';
import { Layout, Space, Button, Card, Modal, Typography } from 'antd';
import { LoadingScreen } from 'components/LoadingScreen';
import { ContactsForm, UserDataForm } from './forms';
import { Contacts, UserData, SaveCVData, GetCVData } from '../../../../common/models/cv';
import { UserService } from 'services/user';
import { CSSProperties, RefObject } from 'react';
import { WarningTwoTone, SaveOutlined, ClearOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Paragraph, Text, Title } = Typography;

type State = {
  isLoading: boolean;
  contactsList: Contacts | null;
  userData: UserData | null;

};

type Props = {
  ownerId: string;
  withdrawConsent: () => void;
};

class EditCV extends React.Component<Props, State> {
  state: State = {
    isLoading: false,
    contactsList: null,
    userData: null
  };

  private userFormRef: RefObject<typeof UserDataForm> = React.createRef();
  private contactsFormRef: RefObject<typeof ContactsForm> = React.createRef();

  private userService = new UserService();

  private nullifyConditional(value: string | null) {
    return value === '' ? null : value;
  }

  private showConfirmationModal() {
    const textStyle: CSSProperties = { textAlign: 'center' };

    const title = (
      <Title level={3} style={{ textAlign: 'center' }}>
        <WarningTwoTone twoToneColor="#fcbe03" /> <Text strong>Are you sure?</Text>
        <WarningTwoTone twoToneColor="#fcbe03" />
      </Title>
    );

    const message =
      "Are you sure you want to delete your CV? The information contained therein will be deleted and employers will not be able to access it.";
    const messageRu =
      'Вы уверены, что хотите удалить свое резюме? Информация, содержащаяся в нем, будет удалена, а работодатели не смогут получить к нему доступ.';
    const confirmationModalContent = (
      <>
        <Paragraph style={textStyle} underline strong>
          {message}
        </Paragraph>
        <Paragraph style={textStyle} underline strong>
          {messageRu}
        </Paragraph>
      </>
    );
    Modal.confirm({
      icon: null,
      title,
      content: confirmationModalContent,
      centered: true,
      maskStyle: { backgroundColor: 'red' },
      maskClosable: true,
      onOk: () => this.props.withdrawConsent()
    });
  }


  private async fetchData() {
    await this.setState({
      isLoading: true,
    });

    const CVData: GetCVData = await this.userService.getCVData(this.props.ownerId);

    const { notes, name, selfIntroLink, militaryService, avatarLink, desiredPosition, englishLevel, email, github, linkedin, location, phone, skype, telegram, website, startFrom, fullTime } = CVData;

    const userData = {
      notes,
      name,
      selfIntroLink,
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      startFrom,
      fullTime
    };

    const contactsList = {
      email,
      github,
      linkedin,
      location,
      phone,
      skype,
      telegram,
      website
    };

    await this.setState({
      contactsList: contactsList,
      userData: userData
    });

    await this.setState({
      isLoading: false,
    });
  }

  private async submitData(data: any) {
    const {
      avatarLink,
      desiredPosition,
      email,
      englishLevel,
      fullTime,
      github,
      linkedin,
      location,
      militaryService,
      name,
      notes,
      phone,
      selfIntroLink,
      skype,
      startFrom,
      telegram,
      website,
    } = data;

    const CVData: SaveCVData = {
      selfIntroLink: this.nullifyConditional(selfIntroLink),
      militaryService,
      avatarLink,
      desiredPosition,
      englishLevel,
      cvName: this.nullifyConditional(name),
      cvNotes: this.nullifyConditional(notes),
      cvPhone: this.nullifyConditional(phone),
      cvEmail: this.nullifyConditional(email),
      cvSkype: this.nullifyConditional(skype),
      cvTelegram: this.nullifyConditional(telegram),
      cvLinkedin: this.nullifyConditional(linkedin),
      cvLocation: this.nullifyConditional(location),
      cvGithub: this.nullifyConditional(github),
      cvWebsite: this.nullifyConditional(website),
      startFrom: startFrom && moment(startFrom).format('YYYY-MM-DD'),
      fullTime
    };

    this.userService.saveCVData(CVData);
  }

  private async handleSave(data: any) {
    await this.submitData(data);
    await this.fetchData();
  }

  private getDataFromRefs(refs: RefObject<any>[]) {
    const values = refs
      .map(ref => {
        const data = ref.current!.getFieldsValue();
        return {
          ...data
        }
      })
      .reduce((resObj, dataObj) => Object.assign(resObj, dataObj), {});
    this.handleSave(values);
  }

  async componentDidMount() {
    await this.fetchData();
  }

  private async fillFromProfile() {
    const id = this.props.ownerId;

    const profile = await this.userService.getProfileInfo(id);

    const name = profile.generalInfo?.name ?? null;
    const notes = profile.generalInfo?.aboutMyself ?? null;
    const location = profile.generalInfo?.location
      ? `${profile.generalInfo.location.cityName}, ${profile.generalInfo.location.countryName}`
      : null;

    const phone = profile.contacts?.phone ?? null;
    const email = profile.contacts?.email ?? null;
    const skype = profile.contacts?.skype ?? null;
    const telegram = profile.contacts?.telegram ?? null;
    const linkedin = profile.contacts?.linkedIn ?? null;

    const prevUserData = this.state.userData;
    const prevContacts = this.state.contactsList;

    const newUserData = {
      ...prevUserData,
      name,
      notes,
    };

    const newContacts = {
      ...prevContacts,
      phone,
      email,
      skype,
      telegram,
      linkedin,
      location,
    };

    await this.setState({
      userData: newUserData as UserData,
      contactsList: newContacts as Contacts,
    });
  }

  private async resetFields () {
    await this.fetchData();
  }

  render() {
    const { isLoading, contactsList, userData } = this.state;

    const buttonStyle = {
      borderRadius: '15px',
      margin: '10px 0'
    };

    return (
      <LoadingScreen show={isLoading}>
        <Layout style={{ margin: 'auto', marginBottom: '10px', maxWidth: '960px' }}>
          <Content>
            <Card>
              <Button style={buttonStyle} block type="primary" htmlType="button" onClick={() => this.fillFromProfile()}>
                Get data from profile
              </Button>
              <Space direction="horizontal" align="start" style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                {userData && <UserDataForm ref={this.userFormRef} userData={userData} />}
                {contactsList && <ContactsForm ref={this.contactsFormRef} contactsList={contactsList} />}
              </Space>
              <div style={{ display: 'flex', justifyContent: "space-between" }}>
                <Button style={{ ...buttonStyle, width: '45%' }} block type="primary" htmlType="button" onClick={() => this.getDataFromRefs([this.userFormRef, this.contactsFormRef])} icon={<SaveOutlined />}>
                  Save
              </Button>
                <Button style={{ ...buttonStyle, width: '45%' }} block type="primary" danger htmlType="button" onClick={this.resetFields.bind(this)} icon={<ClearOutlined />}>
                  Reset fields
              </Button>
              </div>
              <Button style={buttonStyle} block type="primary" danger htmlType="button" onClick={this.showConfirmationModal.bind(this)}>
                Delete my CV
              </Button>
            </Card>
          </Content>
        </Layout>
      </LoadingScreen>
    );
  }
}

export default EditCV;
