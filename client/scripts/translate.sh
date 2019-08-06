#!/bin/sh

lang=$1
API_TOKEN=$POEDITOR_API_TOKEN
API_ID=$POEDITOR_API_ID

make_request() {
	local url
	url=${1}
	shift
	curl -X POST ${url} \
		-F api_token="${API_TOKEN}" \
		-F id="${API_ID}" \
		-F language="${lang}" \
		$@
}

upload() {
	make_request https://api.poeditor.com/v2/projects/upload -F file=@"i18n/${lang}.json" -F updating="terms_translations" $@
}

upload_master() {
  echo "Upload master json"
	upload -F overwrite="1" -F fuzzy_trigger="1" -F tags="{\"all\":\"master\",\"new\":\"new-strings\",\"overwritten_translations\":\"changed-strings\"}"
}

upload_branch() {
	upload -F overwrite="1" -F tags="{\"new\":[\"new-strings\",\"$CI_COMMIT_REF_SLUG\"],\"overwritten_translations\":\"$CI_COMMIT_REF_SLUG\"}"
}

download_one() {
	local url fname tag
	fname=${1}
	tag=${2}
	url=$(
	  make_request "https://api.poeditor.com/v2/projects/export" \
		-F type="key_value_json" \
		-F tags="${tag}" \
		| jq -r '.result.url'
	)

	curl -o ${fname} ${url}
}

download() {
	local fname tag oldtag
	rm -f /tmp/${lang}_1.json /tmp/${lang}_2.json
	if [ -n "${2}" ]; then
		fname=${2}
	else
		fname=i18n/${lang}.json
	fi
	if [ -n "${1}" ]; then
		tag=${1}
	else
		tag=master
	fi
	if [ -n "${CI_COMMIT_REF_NAME}" ]; then
		oldtag=$(echo "${CI_COMMIT_REF_NAME}" | sed 's;/;_;')
	fi
	echo "Downloading master json"
	download_one /tmp/${lang}_1.json master
	wc -l /tmp/${lang}_1.json
	if [ ${tag} != "master" ]; then
		echo "Downloading ${tag} json"
		download_one /tmp/${lang}_2.json ${tag}
		wc -l /tmp/${lang}_2.json
		if [ ! -s /tmp/${lang}_2.json ] && [ -n "${oldtag}" ]; then
			echo "Downloading ${oldtag} json"
			download_one /tmp/${lang}_2.json ${oldtag}
			wc -l /tmp/${lang}_2.json
		fi
	fi
	if [ -s /tmp/${lang}_2.json ]; then
		echo "Merging json files into ${fname}"
		jq -s --indent 2 '.[0] * .[1]' /tmp/${lang}_1.json /tmp/${lang}_2.json > ${fname} || exit 1
		wc -l ${fname}
	else
		echo "Formatting json to ${fname}"
		jq --indent 2 '.' /tmp/${lang}_1.json > ${fname} || exit 1
		wc -l ${fname}
	fi
}


if ! jq -V >/dev/null 2>&1 ; then
	echo "jq is not installed"
	exit 1
fi

case ${2} in
	upload)
		if [ $3 = "master" ]; then
			upload_master
		else
			upload_branch
		fi
		;;
	download)
		download ${3} ${4}
		;;
	*)
		;;
esac
