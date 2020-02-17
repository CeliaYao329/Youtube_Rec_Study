import re
import googleapiclient.discovery
import googleapiclient.errors
from bs4 import BeautifulSoup
import datetime
import csv
import os
import sys

developer_key = "AIzaSyCN1EJLDPW5EnkJCWgLN1AYN5MxK7IPedc"
id2category = {
    '1': 'Film & Animation',
    '2': 'Cars &Vehicles',
    '10': 'Music',
    '15': 'Pets & Animals',
    '17': 'Sport',
    '19': 'Travel & Events',  # api_bug
    '20': 'Gaming',
    '22': 'People & Blogs',  # api_bug
    '23': 'Comedy',
    '24': 'Entertainment',
    '25': 'News & Politics',  # api_bug
    '26': 'How-to & Style',
    '27': 'Education',  # api_bug
    '28': 'Science & Technology',
    '29': 'Non-profits & Activism'  # api_bug
}

# intention = ['Education', 'Music', 'Gaming']
# memory = ['Film & Animation', 'People & Blogs', 'Science & Technology']


def get_ids(takeout_html_file):
    f = open(takeout_html_file, "r")
    watch_content_txt = f.read()
    parsed_html = BeautifulSoup(watch_content_txt, features="html.parser")
    video_divs = parsed_html.body.find_all('div', attrs={'class': 'outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp'})
    ids = []
    times = []
    for div in video_divs:
        try:
            inner_div = div.find('div', attrs={'class': 'content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1'})
            id = inner_div.find('a').get('href')[-11:]


            for a in inner_div.find_all('a'):
                a.replace_with("")
            time_str = inner_div.text[len("Watched"):].strip().split()
            if len(time_str[1]) == 1:
                time_str[1] = '0'+ time_str[1]
            if len(time_str[3]) == 7:
                time_str[3] = '0' + time_str[3]
            time_str = " ".join(time_str[:-1])
            time = datetime.datetime.strptime(time_str, '%b %d, %Y, %I:%M:%S %p')
            ids.append(id)
            times.append(time)
        except:
            pass
    return list(zip(ids, times))


def get_video_info(videos, intention, memory):
    id2time = {video_id: view_time for video_id, view_time in videos}
    ids = list(id2time.keys())
    api_service_name = "youtube"
    api_version = "v3"
    youtube = googleapiclient.discovery.build(api_service_name, api_version, developerKey=developer_key)

    id_str=",".join(ids)
    request = youtube.videos().list(
        part="snippet",
        id=id_str
    )
    response = request.execute()
    items = response['items']
    video_info = []
    for video in items:
        snippet = video['snippet']
        info = dict()
        info['id'] = video['id']
        info['title'] = snippet['title']
        info['description'] = snippet['description'].replace('\n', ' ')
        info['video_url'] = 'https://www.youtube.com/watch?v={}'.format(video['id'])
        info['tags'] = snippet.get('tags', [])
        info['categoryId'] = snippet['categoryId']
        info['category'] = id2category[snippet['categoryId']]
        info['view_time'] = id2time[info['id']]
        info['is_intention'] = info['category'] if info['category'] in intention else "not_intention"
        info['is_memory'] = info['category'] if info['category'] in memory else "not_memory"
        video_info.append(info)
        print(info)
    return video_info

def chunker_list(seq, size):
    return [seq[i:i + size] for i in range(0, len(seq), size)]

if __name__ == "__main__":
    # ids = get_ids(takeout_html_file="test_takeout.html")
    intention, memory = sys.argv[1], sys.argv[2]
    videos = get_ids(takeout_html_file=os.getcwd() + "/views/insight_report/tmp_takeout/Takeout/YouTube/history/watch-history.html")
    # id_chunks = list(chunker_list(ids, int(len(ids)/25)))
    videos_chunks = list(chunker_list(videos, 25))
    videos = []
    for idx, video_chunk in enumerate(videos_chunks):
        videos.extend(get_video_info(video_chunk, intention, memory))
        # videos.update(get_video_info(id_chunk))
    # print(videos)
    with open(os.getcwd() + '/views/insight_report/tmp.csv', 'w', newline='') as file:
        print("saving to...")
        print(os.getcwd() + '/views/insight_report/tmp.csv')
        writer = csv.writer(file)
        writer.writerow(["is_intention", "is_memory", "id", "title", "url", "tags", "categoryId", "category", "time", "description"])
        for v in videos:
            writer.writerow([v['is_intention'], v['is_memory'], v['id'], v['title'], v['video_url'], v['tags'], v['categoryId'], v['category'], v['view_time']])

    print(intention)
    print(memory)
    # videos is a dictionary from id to video info like: title, description, video_url, tags, category
# print("hello")