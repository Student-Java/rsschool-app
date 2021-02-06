import * as React from 'react';
import { Row, Col, Typography, Comment, Tooltip, Button } from 'antd';
import moment from 'moment';
import SectionCV from '../SectionCV';
import { CommentOutlined } from '@ant-design/icons';
import { PublicFeedback } from '../../../../../common/models/profile';

const { Text, Paragraph } = Typography;

type Props = {
  feedback: PublicFeedback[] | null;
};

function PublicFeedbackSection(props: Props) {
  const { feedback } = props;

  const feedbackAvailable = feedback !== null && feedback.length !== 0;
  const title = feedbackAvailable ? `Total feedback count: ${feedback!.length}` : 'No feedback yet';

  const sectionContent = (
    <>
      <Row style={{ fontSize: '16px' }}>
        <Col>
          <Text>{title}</Text>
        </Col>
      </Row>
      {feedbackAvailable && <Feedback feedback={feedback as PublicFeedback[]} showCount={5} />}
    </>
  );

  return <SectionCV content={sectionContent} title="Public feedback" icon={<CommentOutlined className='hide-on-print' />} />;
}

function Feedback(props: { feedback: PublicFeedback[]; showCount: number }) {
  const { feedback, showCount } = props;

  const feedbackStyle = {
    padding: '2px',
    border: '1px solid black',
    borderRadius: '15px',
    marginBottom: '8px',
  };

  const feedbackPartial = feedback.slice(0, showCount);
  const expansionNeeded = feedback.length > showCount;

  const [feedbackToShow, setFeedbackToShow] = React.useState(feedbackPartial);
  const [allFeedbackVisible, setAllFeedbackVisible] = React.useState(!expansionNeeded);

  const showAllFeedback = () => {
    setFeedbackToShow(feedback);
    setAllFeedbackVisible(true);
  };

  const showFeedbackPartially = () => {
    setFeedbackToShow(feedbackPartial);
    setAllFeedbackVisible(false);
  };

  const feedbackElements = feedbackToShow.map((feedback, index) => {
    const {
      comment,
      feedbackDate
    } = feedback;

    return (
      <Comment
        key={`feedback-${index}`}
        style={feedbackStyle}
        content={
          <>
            <Paragraph ellipsis={{ rows: 2, expandable: true }}>{comment}</Paragraph>
          </>
        }
        datetime={
          <Tooltip title={moment(feedbackDate).format('YYYY-MM-DD HH:mm:ss')}>
            <span>{moment(feedbackDate).fromNow()}</span>
          </Tooltip>
        }
      />
    );
  });

  return (
    <Row style={{ fontSize: '16px' }}>
      <Col flex={1}>
        <Text>Recent feedback</Text>
        {feedbackElements}
        {expansionNeeded &&
          (allFeedbackVisible ? (
            <Button className='hide-on-print' onClick={showFeedbackPartially}>Show partially</Button>
          ) : (
            <Button className='hide-on-print' onClick={showAllFeedback}>Show all</Button>
          ))}
      </Col>
    </Row>
  );
}

export default PublicFeedbackSection;
