import React, { FC, useContext } from 'react';
import AppContext from './AppContext';
import { Button, Card, ProgressBar } from 'react-bootstrap';
import Image from 'next/image';
import { useLocale } from '../hooks/useLocale';
import Loading from './Loading';

const FlagList: FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { locale } = useLocale();

  const list = [];
  if (state.type == 'running') {
    for (let i = 0; i < state.ranking.length; i++) {
      const { iso_a2, score, name, info, img, url } =
        state.ranking[i].getInfo(locale);
      list.push(
        <Card key={i} className="item-card" bg="light">
          <Card.Body className="item">
            <div className="flag">
              <a href={url}>
                {img ? (
                  <Image
                    src={img.src}
                    data-a2={iso_a2}
                    width={img.width}
                    height={img.height}
                    title={name}
                    alt={name}
                  />
                ) : null}
              </a>
            </div>
            <div className="info">
              <h3 className="name">
                <span className="rank">{i + 1}.</span> <a href={url}>{name}</a>
              </h3>
              <p className="iso-info">{info}</p>
              <ProgressBar now={score} label={`${Math.round(score)}%`} />
            </div>
          </Card.Body>
        </Card>
      );
    }
    if (!state.all) {
      list.push(
        <Button
          key="button"
          className="more"
          onClick={() => dispatch({ type: 'extend' })}
          variant="outline-secondary"
          block
        >
          More
        </Button>
      );
    }
  }

  return (
    <Loading className="results">
      <div className="items">{list}</div>
    </Loading>
  );
};

export default FlagList;
